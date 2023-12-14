import { readFileSync } from 'fs';
import { resolve } from 'path';
import { init, parse } from 'es-module-lexer';

import type { Context } from './context';
import type { EntryExports, EntryImports, EntryPath, ImportParams, WildcardExports } from './types';
import EntryCleaner from './cleanup-entry';
import Parsers from './parse';
import Utils from './utils';

/**
 * Analyzes target entry files.
 * @see `doAnalyzeEntry`
 * @param ctx _reference_ Plugin's entry analysis context.
 */
async function analyzeEntries(ctx: Context) {
  const targets = [...ctx.targets.entries()];
  await Utils.parallelize(targets, async ([path, depth]) => {
    const absolutePath = (await ctx.resolver(path)) ?? path;
    await methods.analyzeEntry(ctx, absolutePath, depth);
  });

  return ctx.entries;
}

/**
 * Analyzes an entry file if it was not analyzed before.
 * @see `doAnalyzeEntry`
 * @param ctx _reference_ Plugin's entry analysis context.
 * @param entryPath Absolute path of the entry file.
 * @param depth Static analysis' context depth.
 */
async function analyzeEntry(ctx: Context, entryPath: EntryPath, depth: number) {
  if (ctx.entries.has(entryPath)) return;

  await methods.doAnalyzeEntry(ctx, entryPath, depth).catch((e) => {
    console.error(e);
    throw new Error(`Could not analyze entry file "${entryPath}"`);
  });
}

/**
 * Analyzes an entry file and extracts information about its exports.
 * Also, it creates a cleaned-up version of an entry's source code in
 * case it still needs to be served (e.g. through unsupported syntaxes
 * or when importing code the entry actually owns).
 * @param ctx _reference_ Plugin's entry analysis context.
 * @param entryPath Absolute path of the entry file.
 * @param depth Static analysis' context depth.
 */
async function doAnalyzeEntry(ctx: Context, entryPath: EntryPath, depth: number) {
  await init;
  const exportsMap: EntryExports = new Map([]);
  const wildcardExports: WildcardExports = { named: new Map([]), direct: [] };
  const defaultImport: ImportParams = { path: entryPath, importDefault: true };
  const analyzedImports: EntryImports = new Map([['default', defaultImport]]);
  const rawEntry = readFileSync(resolve(entryPath), 'utf-8');
  const [imports, exports] = parse(rawEntry);

  // First analyze the imported entities of the entry.
  for (const { n: path, ss: startPosition, se: endPosition } of imports) {
    await methods.analyzeEntryImport(
      ctx,
      rawEntry,
      wildcardExports,
      analyzedImports,
      entryPath,
      path as string,
      startPosition,
      endPosition,
      depth,
    );
  }

  // Then analyze the exports with the gathered data.
  exports.forEach(({ n: namedExport, ln: localName }) => {
    methods.analyzeEntryExport(
      entryPath,
      exportsMap,
      wildcardExports,
      analyzedImports,
      namedExport,
      localName,
    );
  });

  // Finally export entry's analysis output.
  ctx.entries.set(entryPath, {
    exports: exportsMap,
    wildcardExports,
    source: rawEntry,
    updatedSource: EntryCleaner.cleanupEntry(rawEntry, exportsMap, exports),
    depth,
  });
}

/**
 * Analyzes a single import statement made from an entry.
 * @param ctx Plugin's entry analysis context.
 * @param rawEntry Source code of the entry file.
 * @param wildcardExports _reference_ - aught wildcard exports.
 * @param analyzedImports _reference_ - Map of analyzed imports.
 * @param entryPath Absolute path of the entry point.
 * @param path Path of the imported resource.
 * @param startPosition Import statement start position (based on rawEntry).
 * @param endPosition Import statement end position (based on rawEntry).
 * @param depth Static analysis' context depth.
 */
async function analyzeEntryImport(
  ctx: Context,
  rawEntry: string,
  wildcardExports: WildcardExports,
  analyzedImports: EntryImports,
  entryPath: EntryPath,
  path: string,
  startPosition: number,
  endPosition: number,
  depth: number,
): Promise<void> {
  const statement = rawEntry.slice(startPosition, endPosition);
  const { namedImports, defaultImports, wildcardImport } = Parsers.parseImportStatement(statement);

  defaultImports.forEach((defaultImport) => {
    analyzedImports.set(defaultImport, { path, importDefault: true });
  });

  if (wildcardImport) {
    await methods.registerWildcardImportIfNeeded(ctx, path, entryPath, depth);
    const { alias } = Parsers.parseImportParams(wildcardImport);
    if (alias) {
      wildcardExports.named.set(alias, path);
    } else {
      wildcardExports.direct.push(path);
    }
  }

  namedImports.forEach((namedImport) => {
    const { name, alias } = Parsers.parseImportParams(namedImport);
    analyzedImports.set(alias ?? name, {
      path,
      importDefault: false,
      originalName: name,
    });
  });
}

/**
 * Analyzes a single export statement made from an entry.
 * This maps named exports to their origin paths so that we
 * can later rewrite any import statement of the entry file
 * with individual import statements to mimic tree-shaking behaviour.
 * @param entryPath Absolute path of the entry point.
 * @param exportsMap _reference_ - Map of entry's analyzed exports.
 * @param wilcardExports _reference_ - Map of entry's analyzed exports.
 * @param analyzedImports _reference_ - Map of analyzed imports.
 * @param namedExport Name of the export e.g. (`n` in `export { ln as n }`).
 * @param localName Local name of the export e.g. (`ln` in `export { ln as n }`).
 */
function analyzeEntryExport(
  entryPath: EntryPath,
  exportsMap: EntryExports,
  wilcardExports: WildcardExports,
  analyzedImports: EntryImports,
  namedExport: string,
  localName?: string,
): void {
  if (namedExport && !wilcardExports.named.has(namedExport)) {
    if (analyzedImports.has(namedExport)) {
      const { path, importDefault, originalName } = analyzedImports.get(namedExport)!;
      exportsMap.set(namedExport, { path, importDefault, originalName });
    } else if (localName && analyzedImports.has(localName)) {
      const { path, importDefault } = analyzedImports.get(localName)!;
      exportsMap.set(namedExport, { path, importDefault, originalName: localName });
    } else {
      exportsMap.set(namedExport, {
        path: entryPath,
        importDefault: false,
        originalName: localName,
        selfDefined: true,
      });
    }
  }
}

/**
 * If the wildcard-imported module is not a target entry and the max depth
 * was not reached, registers it so that we can analyze it as an implicit
 * target to later resolve its exports.
 * @see `registerWildcardImport`
 * @param ctx Plugin's entry analysis context.
 * @param path Path to the wildcard-imported module.
 * @param importedFrom Path the wildcard-imported module was imported from.
 * @param depth Static analysis' context depth.
 */
async function registerWildcardImportIfNeeded(
  ctx: Context,
  path: string,
  importedFrom: string,
  depth: number,
) {
  const importsEntry = ctx.targets.get(path) === 0;
  const maxDepthReached = depth >= (ctx.options.maxWildcardDepth ?? 0);
  if (!importsEntry && maxDepthReached) return;
  await methods.registerWildcardImport(ctx, path, importedFrom, depth + 1);
}

/**
 * Registers a wildcard import/export encountered while analyzing an entry.
 * Those are added as implicit targets and analyzed like entries.
 * @param ctx Plugin's entry analysis context.
 * @param path Path to the wildcard-imported module.
 * @param importedFrom Path the wildcard-imported module was imported from.
 * @param depth Static analysis' context depth.
 */
async function registerWildcardImport(
  ctx: Context,
  path: string,
  importedFrom: string,
  depth: number,
) {
  const resolvedPath = await ctx.resolver(path, importedFrom);
  if (!resolvedPath || ctx.targets.has(resolvedPath)) return;
  ctx.targets.set(resolvedPath, depth);
  await methods.analyzeEntry(ctx, resolvedPath, depth);
}

const methods = {
  analyzeEntries,
  analyzeEntry,
  doAnalyzeEntry,
  analyzeEntryImport,
  analyzeEntryExport,
  registerWildcardImportIfNeeded,
  registerWildcardImport,
};

export default methods;
