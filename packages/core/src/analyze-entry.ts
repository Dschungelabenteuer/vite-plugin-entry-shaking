import type { ExportSpecifier } from 'es-module-lexer';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { init, parse } from 'es-module-lexer';

import type { Context } from './context';
import type {
  EntryExports,
  EntryImports,
  EntryPath,
  ImportParams,
  RemoveReadonly,
  WildcardExports,
} from './types';

import EntryCleaner from './cleanup-entry';
import Parsers from './parse';
import Utils, { diagnostic } from './utils';

/**
 * Analyzes target entry files.
 * @see `doAnalyzeEntry`
 * @param ctx _reference_ Plugin's entry analysis context.
 */
async function analyzeEntries(ctx: Context) {
  const { time, self, out } = await ctx.measure('Analysis of target entry files', async () => {
    const targets = [...ctx.targets.entries()];
    await Utils.parallelize(targets, async ([path, depth]) => {
      const absolutePath = (await ctx.resolver(path)) ?? path;
      await methods.analyzeEntry(ctx, absolutePath, depth);
    });
    return ctx.entries;
  });

  ctx.metrics.analysis = { time, self };
  ctx.metrics.process = time;
  return out;
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

  return await methods.doAnalyzeEntry(ctx, entryPath, depth).catch((e) => {
    const message = `Could not analyze entry file "${entryPath}"`;
    console.error(e);
    ctx.logger.error(message);
    throw new Error(message);
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
  const exportsMap: EntryExports = new Map([]);
  const wildcardExports: WildcardExports = { named: new Map([]), direct: [] };
  let source: string = '';
  let exps: ExportSpecifier[] = [];
  let inclusiveTime = 0;

  const { time } = await ctx.measure(`Analysis of entry "${entryPath}"`, async () => {
    await init;
    source = readFileSync(resolve(entryPath), 'utf-8');
    const defaultImport: ImportParams = { path: entryPath, importDefault: true };
    const analyzedImports: EntryImports = new Map([['default', defaultImport]]);
    const [imports, exportList] = parse(source);
    exps = exportList as RemoveReadonly<ExportSpecifier[]>;

    // First analyze the imported entities of the entry.
    for (const { n: path, ss: startPosition, se: endPosition } of imports) {
      inclusiveTime += await methods.analyzeEntryImport(
        ctx,
        source,
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
    exps.forEach(({ n: namedExport, ln: localName }) => {
      methods.analyzeEntryExport(
        entryPath,
        exportsMap,
        wildcardExports,
        analyzedImports,
        namedExport,
        localName,
      );
    });
  });

  const updatedSource = EntryCleaner.cleanupEntry(source, exportsMap, exps);
  const charactersDiff = source.length - updatedSource.length;
  const self = time - inclusiveTime;

  // Finally export entry's analysis output.
  ctx.logger.debug(`Cleaned-up entry "${entryPath}" (-${charactersDiff} chars)`);
  ctx.metrics.process += time;
  ctx.entries.set(entryPath, {
    exports: exportsMap,
    wildcardExports,
    source,
    updatedSource,
    depth,
    time,
    self,
  });

  return time;
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
) {
  let inclusiveTime = 0;
  const statement = rawEntry.slice(startPosition, endPosition);
  const { namedImports, defaultImports, wildcardImport } = Parsers.parseImportStatement(statement);

  defaultImports.forEach((defaultImport) => {
    analyzedImports.set(defaultImport, { path, importDefault: true });
  });

  if (wildcardImport) {
    const out = await methods.registerWildcardImportIfNeeded(ctx, path, entryPath, depth);
    inclusiveTime += out ?? 0;
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

  return inclusiveTime;
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

  if (maxDepthReached) {
    if (importsEntry) {
      ctx.logger.debug(
        `Max depth reached, but ${importedFrom} wildcard-imports from another entry ${path}, all good!`,
      );
    } else {
      const level = ctx.options.enableDiagnostics ? 'warn' : 'debug';
      const base = `Max depth reached at path ${importedFrom}, skipping wildcard import analysis of ${path}…`;
      const message = ctx.options.enableDiagnostics
        ? diagnostic(
            `${base} This means that if you were to import one of the entities exported by ${path} from ${importedFrom},` +
              ` it would load the cleaned-up entry file which still includes the unmutated wildcard import, resulting in` +
              ` all subsequent modules being loaded by Vite. Consider either adding ${path} to the "targets" option or a` +
              ` bit of refactoring to minimize usage of wildcards.`,
          )
        : base;
      ctx.logger[level](message);
      return 0;
    }
  }

  return await methods.registerWildcardImport(ctx, path, importedFrom, depth + 1);
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
  return await methods.analyzeEntry(ctx, resolvedPath, depth);
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
