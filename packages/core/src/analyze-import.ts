/* eslint-disable no-continue */
import type MagicString from 'magic-string';
import type { ResolveFn } from 'vite';
import { normalizePath } from 'vite';

import type {
  EntryData,
  EntryPath,
  ImportInput,
  ImportStatement,
  PluginEntries,
  TargetImports,
} from './types';

import { addSourceQuerySuffix } from './urls';
import Parsers from './parse';
import Utils from './utils';

const WILDCARD_IMPORT_PREFIX = 'import *';

/**
 * Returns the entities imported from the target entry.
 * @param code Import statement string.
 * @param startPosition Start position of the import statement.
 * @param endPosition End position of the import statement.
 */
function getImportedEntryExports(code: string, startPosition: number, endPosition: number) {
  const source = code.slice(startPosition, endPosition);
  const imports = Parsers.parseImportStatement(source);
  return [
    ...imports.namedImports,
    ...(imports.defaultImports.length ? imports.defaultImports.map((a) => `default as ${a}`) : []),
  ];
}

/**
 * Returns a map of structured information about entities imported from target entry.
 * @param entries _reference_ - Map of parsed entry files.
 * @param entry Imported entry data.
 * @param entryPath Absolute path to the target entry.
 * @param imports List of imports.
 * @param resolver Vite's resolve function.
 *
 * @note Imports are proceeded in parallel, so the output order is not guaranteed.
 * While this does not affect the plugin's behavior, it may affect tests.
 */
async function getImportsMap(
  entries: PluginEntries,
  entry: EntryData,
  entryPath: EntryPath,
  imports: string[],
  resolver: ResolveFn,
): Promise<TargetImports> {
  const map: TargetImports = new Map([]);

  await Utils.parallelize(imports, async (importString) => {
    const { name, alias } = Parsers.parseImportParams(importString);
    const found = await resolveImport(entries, entry, entryPath, map, name, alias, resolver);
    if (found) return;

    map.set(entryPath, [...(map.get(entryPath) ?? []), { name, importDefault: false }]);
  });

  return map;
}

/**
 * Resolves an import from an import statement.
 * @param entries _reference_ - Map of parsed entry files.
 * @param entry Imported entry data.
 * @param path Absolute path to the target entry.
 * @param map _reference_ - Map of imports.
 * @param name Name of the import.
 * @param alias Alias of the import.
 * @param resolver Vite's resolve function.
 */
export async function resolveImport(
  entries: PluginEntries,
  entry: EntryData,
  path: EntryPath,
  map: TargetImports,
  name: string,
  alias: string,
  resolver: ResolveFn,
) {
  const namedImport = await findNamedImport(entry, path, map, name, alias, resolver);
  if (namedImport) return true;

  const namedWildcard = await findNamedWildcard(entries, entry, path, map, name, alias, resolver);
  if (namedWildcard) return true;

  const out = await findDirectWildcardExports(entries, entry, path, map, name, alias, resolver);
  return out !== undefined;
}

/**
 * Tries to find and register a named import from an import statement.
 * Returns true if it found the entity.
 * @param entry Imported entry data.
 * @param entryPath Absolute path to the target entry.
 * @param map _reference_ - Map of imports.
 * @param name Name of the import.
 * @param alias Alias of the import.
 * @param resolver Vite's resolve function.
 */
export async function findNamedImport(
  entry: EntryData,
  entryPath: EntryPath,
  map: TargetImports,
  name: string,
  alias: string,
  resolver: ResolveFn,
) {
  const namedImport = entry.exports.get(name);
  if (namedImport) {
    const resolvedPath = await resolver(namedImport.path, entryPath);
    if (resolvedPath) {
      const { importDefault, originalName } = namedImport;
      map.set(resolvedPath, [
        ...(map.get(resolvedPath) ?? []),
        { name, importDefault, originalName, alias },
      ]);
    }
    return namedImport;
  }
}

/**
 * Tries to find and register an entity that was wildcard-imported and
 * re-exported using an alias (`import/export * as Something from '…'`).
 * Returns true if it found the entity.
 * @param entries _reference_ - Map of parsed entry files.
 * @param entry Imported entry data.
 * @param entryPath Absolute path to the target entry.
 * @param map _reference_ - Map of imports.
 * @param name Name of the import.
 * @param alias Alias of the import.
 * @param resolver Vite's resolve function.
 */
export async function findNamedWildcard(
  entries: PluginEntries,
  entry: EntryData,
  entryPath: EntryPath,
  map: TargetImports,
  name: string,
  alias: string,
  resolver: ResolveFn,
) {
  const wildcardImport = entry.wildcardExports?.named.get(name);
  if (wildcardImport) {
    const resolvedPath = await resolver(wildcardImport, entryPath);
    const resolvedEntry = resolvedPath ? entries.get(resolvedPath) : undefined;
    if (resolvedPath && resolvedEntry) {
      map.set(resolvedPath, [
        ...(map.get(resolvedPath) ?? []),
        { name: '*', importDefault: true, alias: name },
      ]);
      return true;
    }
  }
}

/**
 * Tries to find and register an entity that was directly wildcard-exported (`export * from '…`).
 * Returns true if it found the entity.
 * @param entries _reference_ - Map of parsed entry files.
 * @param entry Imported entry data.
 * @param entryPath Absolute path to the target entry.
 * @param map _reference_ - Map of imports.
 * @param name Name of the import.
 * @param alias Alias of the import.
 * @param resolver Vite's resolve function.
 */
export async function findDirectWildcardExports(
  entries: PluginEntries,
  entry: EntryData,
  entryPath: EntryPath,
  map: TargetImports,
  name: string,
  alias: string,
  resolver: ResolveFn,
) {
  const wildcardExports = entry.wildcardExports?.direct ?? [];
  for (const wildcardExportPath of wildcardExports) {
    const resolvedPath = await resolver(wildcardExportPath, entryPath);
    const resolvedEntry = resolvedPath ? entries.get(resolvedPath) : undefined;
    const resolvedExport = resolvedEntry ? resolvedEntry.exports.get(name) : undefined;
    if (resolvedPath) {
      if (resolvedExport) {
        map.set(resolvedPath, [
          ...(map.get(resolvedPath) ?? []),
          { name, ...resolvedExport, alias },
        ]);
        return resolvedExport;
      }

      if (resolvedEntry && resolvedEntry.wildcardExports) {
        const found = await resolveImport(
          entries,
          resolvedEntry,
          resolvedPath,
          map,
          name,
          alias,
          resolver,
        );

        if (found) return true;
      }
    }
  }
}

/**
 * Formats a single entity import replacement.
 * @param analyzedImport Analyzed import.
 */
const formatImportReplacement = ({ name, alias, originalName, importDefault }: ImportInput) => {
  if (importDefault) return `default as ${alias ?? originalName ?? name}`;
  if (originalName) return `${originalName} as ${alias ?? name}`;
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
  const entityMap = new Map<string, string[]>();
  const originalEntry = entries.get(path)!;
  const wildcardImports: ImportStatement[] = [];

  for (const entity of imported) {
    const { originalName, alias, name, importDefault } = entity;

    if (importDefault && name === '*') {
      wildcardImports.push(`import * as ${alias} from '${path}'`);
      continue;
    }

    if (originalName && originalEntry.exports.has(originalName)) {
      const originalImport = originalEntry.exports.get(originalName)!;
      const resolvedPath = await resolver(originalImport.path, path);
      if (!resolvedPath) continue;

      const resolvedImports = methods.formatImportReplacement({
        ...originalImport,
        name: originalName,
        alias,
      });

      entityMap.set(resolvedPath, [...(entityMap.get(resolvedPath) ?? []), resolvedImports]);
    }
  }

  const imports = [...entityMap.entries()];
  const formattedImports = imports.map(
    ([p, ents]) => `import { ${ents.join(', ')} } from '${p}'`,
  ) as ImportStatement[];

  return [...formattedImports, ...wildcardImports];
};

/**
 * Analyzes and transforms a single target import.
 * @param src MagicString instance to prepare transforms.
 * @param code Source code of the file.
 * @param entries _reference_ - Map of parsed entry files.
 * @param entry Imported entry data.
 * @param entryPath Absolute path to the target entry.
 * @param startPosition Start position of the import statement.
 * @param endPosition End position of the import statement.
 * @param resolver Vite's resolve function.
 */
const analyzeImportStatement = async (
  src: MagicString,
  code: string,
  entries: PluginEntries,
  entry: EntryData,
  entryPath: EntryPath,
  startPosition: number,
  endPosition: number,
  resolver: ResolveFn,
) => {
  const isWildCardImport = catchWildcardImport(src, code, startPosition, endPosition, entryPath);
  if (isWildCardImport) return;

  const imports = methods.getImportedEntryExports(code, startPosition, endPosition);
  const imported = await methods.getImportsMap(entries, entry, entryPath, imports, resolver);
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

const methods = {
  getImportedEntryExports,
  getImportsMap,
  getImportReplacements,
  resolveImportedEntities,
  resolveImportedCircularEntities,
  formatImportReplacement,
  analyzeImportStatement,
};

export default methods;
