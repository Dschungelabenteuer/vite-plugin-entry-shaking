/* eslint-disable no-continue */
import type MagicString from 'magic-string';
import { normalizePath } from 'vite';

import type { Context } from './context';
import type { EntryData, EntryPath, ImportInput, ImportStatement, TargetImports } from './types';

import { addSourceQuerySuffix } from './urls';
import Parsers from './parse';
import Utils from './utils';

const WILDCARD_IMPORT_PREFIX = 'import *';
const DYNAMIC_IMPORT_PREFIX = 'import(';
const TYPE_ONLY_IMPORT_PREFIX = 'import type';
// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/importAnalysis.ts#L83
const VITE_IGNORE_REGEX = /\/\*\s*@vite-ignore\s*\*\//;

/**
 * Analyzes and transforms a single target import.
 * @param ctx _reference_ Plugin context.
 * @param src MagicString instance to prepare transforms.
 * @param code Source code of the file.
 * @param entry Imported entry data.
 * @param entryPath Absolute path to the target entry.
 * @param startPosition Start position of the import statement.
 * @param endPosition End position of the import statement.
 */
export async function analyzeImportStatement(
  ctx: Context,
  src: MagicString,
  code: string,
  entry: EntryData,
  entryPath: EntryPath,
  startPosition: number,
  endPosition: number,
) {
  const isWildCardImport = catchWildcardImport(src, code, startPosition, endPosition, entryPath);
  if (isWildCardImport) return;

  const isDynamicImport = catchDynamicImport(src, code, startPosition, endPosition, entryPath);
  if (isDynamicImport) return;

  const imports = methods.getImportedEntryExports(code, startPosition, endPosition);
  const imported = await methods.getImportsMap(ctx, entry, entryPath, imports);
  const replacement = await methods.getImportReplacements(ctx, imported, entryPath);
  src.overwrite(startPosition, endPosition + 1, `${replacement.join(';\n')};`);
}

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
 * @param ctx _reference_ Plugin context.
 * @param entry Imported entry data.
 * @param entryPath Absolute path to the target entry.
 * @param imports List of imports.
 * @note Imports are proceeded in parallel, so the output order is not guaranteed.
 * While this does not affect the plugin's behavior, it may affect tests.
 */
async function getImportsMap(
  ctx: Context,
  entry: EntryData,
  entryPath: EntryPath,
  imports: string[],
): Promise<TargetImports> {
  const map: TargetImports = new Map([]);

  await Utils.parallelize(imports, async (importString) => {
    const { name, alias } = Parsers.parseImportParams(importString);
    const found = await methods.resolveImport(ctx, entry, entryPath, map, name, alias);
    if (found) return;

    map.set(entryPath, [...(map.get(entryPath) ?? []), { name, importDefault: false }]);
  });

  return map;
}

/**
 * Resolves an import from an import statement.
 * @param ctx _reference_ Plugin context.
 * @param entry Imported entry data.
 * @param path Absolute path to the target entry.
 * @param map _reference_ - Map of imports.
 * @param name Name of the import.
 * @param alias Alias of the import.
 */
async function resolveImport(
  ctx: Context,
  entry: EntryData,
  path: EntryPath,
  map: TargetImports,
  name: string,
  alias: string,
) {
  const namedImport = await methods.findNamedImport(ctx, entry, path, map, name, alias);
  if (namedImport) return true;

  const namedWildcard = await methods.findNamedWildcard(ctx, entry, path, map, name);
  if (namedWildcard) return true;

  const out = await methods.findDirectWildcardExports(ctx, entry, path, map, name, alias);
  return out !== undefined;
}

/**
 * Tries to find and register a named import from an import statement.
 * Returns true if it found the entity.
 * @param ctx _reference_ Plugin context.
 * @param entry Imported entry data.
 * @param entryPath Absolute path to the target entry.
 * @param map _reference_ - Map of imports.
 * @param name Name of the import.
 * @param alias Alias of the import.
 */
export async function findNamedImport(
  ctx: Context,
  entry: EntryData,
  entryPath: EntryPath,
  map: TargetImports,
  name: string,
  alias: string,
) {
  const namedImport = entry.exports.get(name);
  if (namedImport) {
    const resolvedPath = await ctx.resolver(namedImport.path, entryPath);
    if (resolvedPath) {
      const { importDefault, originalName } = namedImport;
      map.set(resolvedPath, [
        ...(map.get(resolvedPath) ?? []),
        { name, importDefault, originalName, alias },
      ]);
      return true;
    }
  }
}

/**
 * Tries to find and register an entity that was wildcard-imported and
 * re-exported using an alias (`import/export * as Something from '…'`).
 * Returns true if it found the entity.
 * @param ctx _reference_ Plugin context.
 * @param entry Imported entry data.
 * @param entryPath Absolute path to the target entry.
 * @param map _reference_ - Map of imports.
 * @param name Name of the import.
 */
export async function findNamedWildcard(
  ctx: Context,
  entry: EntryData,
  entryPath: EntryPath,
  map: TargetImports,
  name: string,
) {
  const wildcardImport = entry.wildcardExports?.named.get(name);
  if (wildcardImport) {
    const resolvedPath = await ctx.resolver(wildcardImport, entryPath);
    const resolvedEntry = resolvedPath ? ctx.entries.get(resolvedPath) : undefined;
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
 * @param ctx _reference_ Plugin context.
 * @param entries _reference_ - Map of parsed entry files.
 * @param entry Imported entry data.
 * @param entryPath Absolute path to the target entry.
 * @param map _reference_ - Map of imports.
 * @param name Name of the import.
 * @param alias Alias of the import.
 * @param resolver Vite's resolve function.
 */
export async function findDirectWildcardExports(
  ctx: Context,
  entry: EntryData,
  entryPath: EntryPath,
  map: TargetImports,
  name: string,
  alias: string,
) {
  const wildcardExports = entry.wildcardExports?.direct ?? [];
  for (const wildcardExportPath of wildcardExports) {
    const resolvedPath = await ctx.resolver(wildcardExportPath, entryPath);
    const resolvedEntry = resolvedPath ? ctx.entries.get(resolvedPath) : undefined;
    const resolvedExport = resolvedEntry ? resolvedEntry.exports.get(name) : undefined;
    if (resolvedPath) {
      if (resolvedExport) {
        map.set(resolvedPath, [
          ...(map.get(resolvedPath) ?? []),
          { name, ...resolvedExport, alias },
        ]);
        return true;
      }

      if (resolvedEntry && resolvedEntry.wildcardExports) {
        const found = await methods.resolveImport(
          ctx,
          resolvedEntry,
          resolvedPath,
          map,
          name,
          alias,
        );
        if (found) return true;
      }
    }
  }
}

/**
 * Returns replacement lines for an import statement of a target entry.
 * @param ctx _reference_ Plugin context.
 * @param imports Analyzed imports from target entry.
 * @param entryPath Absolute path to the target entry.
 */
async function getImportReplacements(
  ctx: Context,
  imports: TargetImports,
  entryPath: EntryPath,
): Promise<ImportStatement[]> {
  const replacement: ImportStatement[] = [];
  // Iterate over all imported entities to rewrite a dedicated import statement.
  for (const [importedPath, importedEntities] of imports) {
    const path = normalizePath(importedPath);
    const content = await methods.resolveImportedEntities(ctx, importedEntities, entryPath, path);

    replacement.push(content.join('\n') as ImportStatement);
  }

  return replacement;
}

/**
 * Resolves imported entities and handles possible re-exports of other target entries.
 * @param ctx _reference_ Plugin context.
 * @param imported Analyzed imported entities from target entry.
 * @param entryPath Absolute path to the target entry.
 * @param path Path of imported module.
 */
async function resolveImportedEntities(
  ctx: Context,
  imported: ImportInput[],
  entryPath: EntryPath,
  path: string,
): Promise<ImportStatement[]> {
  // If the imported item is part of another entry point, let's resolve it from analysis.
  if (path !== entryPath && ctx.entries.has(path)) {
    return methods.resolveImportedCircularEntities(ctx, imported, path);
  }

  const imports = imported.map((entity) => methods.formatImportReplacement(entity));
  return [`import { ${imports.join(', ')} } from '${path}'`];
}

/**
 * Resolves re-exports of other target entries.
 * @param ctx _reference_ Plugin context.
 * @param imported Analyzed imported entities from target entry.
 * @param path Path of imported module.
 */
async function resolveImportedCircularEntities(
  ctx: Context,
  imported: ImportInput[],
  path: string,
) {
  const entityMap = new Map<string, string[]>();
  const originalEntry = ctx.entries.get(path)!;
  const wildcardImports: ImportStatement[] = [];

  for (const entity of imported) {
    const { originalName, alias, name, importDefault } = entity;

    if (importDefault && name === '*') {
      wildcardImports.push(`import * as ${alias} from '${path}'`);
      continue;
    }

    if (originalName && originalEntry.exports.has(originalName)) {
      const originalImport = originalEntry.exports.get(originalName)!;
      const resolvedPath = await ctx.resolver(originalImport.path, path);
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
}

/**
 * Formats a single entity import replacement.
 * @param analyzedImport Analyzed import.
 */
function formatImportReplacement({ name, alias, originalName, importDefault }: ImportInput) {
  if (importDefault) return `default as ${alias ?? originalName ?? name}`;
  if (originalName) return `${originalName} as ${alias ?? name}`;
  return `${name}${alias ? ` as ${alias}` : ''}`;
}

/**
 * Catches and handles wildcard import statement.
 * @param src MagicString instance to prepare transforms.
 * @param code Source code of the file.
 * @param startPosition Start position of the import statement.
 * @param endPosition End position of the import statement.
 * @param entryPath Absolute path to the target entry.
 */
function catchWildcardImport(
  src: MagicString,
  code: string,
  startPosition: number,
  endPosition: number,
  entryPath: EntryPath,
) {
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
}

function isTypeOnlyImport(code: string, startPosition: number) {
  return code.slice(startPosition, TYPE_ONLY_IMPORT_PREFIX.length) === TYPE_ONLY_IMPORT_PREFIX;
}

/**
 * Catches and handles a dynamic/async import statement.
 * @param src MagicString instance to prepare transforms.
 * @param code Source code of the file.
 * @param startPosition Start position of the import statement.
 * @param endPosition End position of the import statement.
 * @param entryPath Absolute path to the target entry.
 */
function catchDynamicImport(
  src: MagicString,
  code: string,
  startPosition: number,
  endPosition: number,
  entryPath: EntryPath,
) {
  const source = code.slice(startPosition, endPosition);
  const flatSource = source.replace(/\s/gm, '');
  const isViteIgnored = VITE_IGNORE_REGEX.test(flatSource);
  const isDynamicImport = flatSource.startsWith(DYNAMIC_IMPORT_PREFIX);
  const updatedPath = addSourceQuerySuffix(entryPath);

  if (isDynamicImport && !isViteIgnored) {
    src.overwrite(startPosition, endPosition, `import('${updatedPath}')`);
  }

  return isDynamicImport;
}

const methods = {
  analyzeImportStatement,
  getImportedEntryExports,
  getImportsMap,
  resolveImport,
  findNamedImport,
  findNamedWildcard,
  findDirectWildcardExports,
  getImportReplacements,
  resolveImportedEntities,
  resolveImportedCircularEntities,
  formatImportReplacement,
  catchWildcardImport,
  catchDynamicImport,
  isTypeOnlyImport,
};

export default methods;
