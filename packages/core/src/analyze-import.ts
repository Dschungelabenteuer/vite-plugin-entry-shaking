import type MagicString from 'magic-string';
import type { ResolveFn } from 'vite';
import { normalizePath } from 'vite';

import type {
  EntryExports,
  EntryPath,
  ImportInput,
  ImportStatement,
  PluginEntries,
  TargetImports,
} from './types';

import { addSourceQuerySuffix } from './urls';

const WILDCARD_IMPORT_PREFIX = 'import *';

/**
 * Returns the import params of a single imported entity.
 * @param importString Import statement string.
 */
const getImportParams = (importString: string) => {
  const [name, alias] = importString.trim().split(' as ');
  return { name, alias };
};

/**
 * Returns the names of the entities imported from the target entry.
 * @param code Import statement string.
 * @param startPosition Start position of the import statement.
 * @param endPosition End position of the import statement.
 */
const getImportedNamedExports = (
  code: string,
  startPosition: number,
  endPosition: number,
): string[] => {
  const [, importContentString] =
    code.slice(startPosition, endPosition).match(/{([\s\S]*?)}/) ?? [];

  return (importContentString?.split(',') ?? []).map((namedExport) => namedExport.trim());
};

/**
 * Returns a map of structured information about entities imported from target entry.
 * @param entryExports List of analyzed exports of the target entry.
 * @param entryPath Absolute path to the target entry.
 * @param imports List of named imports.
 * @param resolver Vite's resolve function.
 */
const getImportsMap = async (
  entryExports: EntryExports,
  entryPath: EntryPath,
  imports: string[],
  resolver: ResolveFn,
): Promise<TargetImports> => {
  const map: TargetImports = new Map([]);

  await Promise.all(
    imports.map(async (importString) => {
      const { name, alias } = methods.getImportParams(importString);
      const namedImport = entryExports.get(name);
      if (namedImport) {
        const resolvedPath = await resolver(namedImport.path, entryPath);
        if (resolvedPath) {
          const { importDefault, originalName } = namedImport;
          map.set(resolvedPath, [
            ...(map.get(resolvedPath) ?? []),
            { name, importDefault, originalName, alias },
          ]);
        }
      } else {
        map.set(entryPath, [...(map.get(entryPath) ?? []), { name, importDefault: false }]);
      }
    }),
  );

  return map;
};

/**
 * Formats a single entity import replacement.
 * @param analyzedImport Analyzed import.
 */
const formatImportReplacement = ({ name, alias, originalName, importDefault }: ImportInput) => {
  if (importDefault) return `default as ${alias ?? originalName ?? name}`;
  if (originalName) return `${originalName}${alias ? ` as ${alias}` : ` as ${name}`}`;
  return `${name}${alias ? ` as ${alias}` : ''}`;
};

/**
 * Returns replacement lines for an import statement of a target entry.
 * @param imports Analyzed imports from target entry.
 * @param entryPath Absolute path to the target entry.
 * @param entries _reference_ - Map of parsed entry files.
 * @param resolver Vite's resolve function.
 */
const getImportReplacements = async (
  imports: TargetImports,
  entryPath: EntryPath,
  entries: PluginEntries,
  resolver: ResolveFn,
): Promise<ImportStatement[]> => {
  const replacement: ImportStatement[] = [];
  // Iterate over all imported entities to rewrite a dedicated import statement.
  for (const [importedPath, importedEntities] of imports) {
    const path = normalizePath(importedPath);
    const content = await methods.resolveImportedEntities(
      importedEntities,
      entryPath,
      entries,
      resolver,
      path,
    );

    replacement.push(content.join('\n') as ImportStatement);
  }

  return replacement;
};

/**
 * Resolves imported entities and handles possible re-exports of other target entries.
 * @param imported Analyzed imported entities from target entry.
 * @param entryPath Absolute path to the target entry.
 * @param entries _reference_ - Map of parsed entry files.
 * @param resolver Vite's resolve function.
 * @param path Path of imported module.
 */
const resolveImportedEntities = async (
  imported: ImportInput[],
  entryPath: EntryPath,
  entries: PluginEntries,
  resolver: ResolveFn,
  path: string,
): Promise<ImportStatement[]> => {
  // If the imported item is part of another entry point, let's resolve it from analysis.
  if (path !== entryPath && entries.has(path)) {
    return methods.resolveImportedCircularEntities(imported, entries, resolver, path);
  }

  const imports = imported.map((entity) => methods.formatImportReplacement(entity));
  return [`import { ${imports.join(', ')} } from '${path}'`];
};

/**
 * Resolves re-exports of other target entries.
 * @param imported Analyzed imported entities from target entry.
 * @param entries _reference_ - Map of parsed entry files.
 * @param resolver Vite's resolve function.
 * @param path Path of imported module.
 */
const resolveImportedCircularEntities = async (
  imported: ImportInput[],
  entries: PluginEntries,
  resolver: ResolveFn,
  path: string,
) => {
  const output: ImportStatement[] = [];
  const originalEntry = entries.get(path)!;
  for (const entity of imported) {
    const { originalName } = entity;
    if (originalName && originalEntry.exports.has(originalName)) {
      const originalImport = originalEntry.exports.get(originalName)!;
      const resolvedPath = await resolver(originalImport.path, path);
      const resolvedImports = methods.formatImportReplacement(entity);
      output.push(`import { ${resolvedImports} } from '${resolvedPath}'`);
    }
  }
  return output;
};

/**
 * Analyzes and transforms a single target import.
 * @param src MagicString instance to prepare transforms.
 * @param code Source code of the file.
 * @param entries _reference_ - Map of parsed entry files.
 * @param entryExports List of analyzed exports of the target file.
 * @param entryPath Absolute path to the target entry.
 * @param startPosition Start position of the import statement.
 * @param endPosition End position of the import statement.
 * @param resolver Vite's resolve function.
 */
const analyzeImportStatement = async (
  src: MagicString,
  code: string,
  entries: PluginEntries,
  entryExports: EntryExports,
  entryPath: EntryPath,
  startPosition: number,
  endPosition: number,
  resolver: ResolveFn,
) => {
  const isWildCardImport = catchWildcardImport(src, code, startPosition, endPosition, entryPath);
  if (isWildCardImport) return;

  const namedImports = methods.getImportedNamedExports(code, startPosition, endPosition);
  const imported = await methods.getImportsMap(entryExports, entryPath, namedImports, resolver);
  const replacement = await methods.getImportReplacements(imported, entryPath, entries, resolver);

  src.overwrite(startPosition, endPosition + 1, `${replacement.join(';\n')};`);
};

/**
 * Catches and handles import statement is a wildcard import.
 * @param src MagicString instance to prepare transforms.
 * @param code Source code of the file.
 * @param startPosition Start position of the import statement.
 * @param endPosition End position of the import statement.
 * @param entryPath Absolute path to the target entry.
 */
const catchWildcardImport = (
  src: MagicString,
  code: string,
  startPosition: number,
  endPosition: number,
  entryPath: EntryPath,
) => {
  const isWildCardImport =
    code.slice(startPosition, WILDCARD_IMPORT_PREFIX.length) === WILDCARD_IMPORT_PREFIX;

  if (isWildCardImport) {
    const [what] = code.slice(startPosition, endPosition).split('from');
    src.overwrite(
      startPosition,
      endPosition + 1,
      `${what.trim()} from "${addSourceQuerySuffix(entryPath)}";`,
    );
  }

  return isWildCardImport;
};

/**
 * Catches and handles default import statement.
 * (this only applies to `import something from 'somewhere'`).
 * @param src MagicString instance to prepare transforms.
 * @param code Source code of the file.
 * @param startPosition Start position of the import statement.
 * @param startPosition Start position of the import statement.
 * @param entryPath Absolute path to the target entry.
 */
const catchDefaultImport = (
  src: MagicString,
  code: string,
  startPosition: number,
  endPosition: number,
  entryPath: EntryPath,
) => {
  const isWildCardImport =
    code.slice(startPosition, WILDCARD_IMPORT_PREFIX.length) === WILDCARD_IMPORT_PREFIX;

  if (isWildCardImport) {
    const [what] = code.slice(startPosition, endPosition).split('from');
    src.overwrite(
      startPosition,
      endPosition + 1,
      `${what.trim()} from "${addSourceQuerySuffix(entryPath)}";`,
    );
  }

  return isWildCardImport;
};

const methods = {
  getImportParams,
  getImportedNamedExports,
  getImportsMap,
  getImportReplacements,
  resolveImportedEntities,
  resolveImportedCircularEntities,
  formatImportReplacement,
  analyzeImportStatement,
};

export default methods;
