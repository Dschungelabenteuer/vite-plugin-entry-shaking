import type { ExportSpecifier } from 'es-module-lexer';
import { init, parse } from 'es-module-lexer';

import type { Context } from './context';
import type {
  EntryExports,
  EntryImports,
  EntryPath,
  ImportParams,
  Duration,
  RemoveReadonly,
  WildcardExports,
  PluginEntries,
  DiagnosticsConfig,
} from './types';

import EntryCleaner from './cleanup-entry';
import Parsers from './parse';
import Utils, { getCodeFromPath } from './utils';
import { DiagnosticKinds } from './diagnostics';

/**
 * Analyzes target entry files.
 * @see `doAnalyzeEntry`
 * @param ctx _reference_ Plugin's entry analysis context.
 */
async function analyzeEntries(ctx: Context): Promise<PluginEntries> {
  const { time, out } = await ctx.timer.measure('Analysis of target entry files', async () => {
    const targets = [...ctx.targets.entries()];
    await Utils.parallelize(targets, async ([path, depth]) => {
      const absolutePath = (await ctx.resolver(path)) ?? path;
      await methods.analyzeEntry(ctx, absolutePath, depth);
    });
    return ctx.entries;
  });

  ctx.logger.success(`Entries analysis complete`);
  ctx.metrics.analysis = time;
  ctx.metrics.process = time;
  return out!;
}

/**
 * Analyzes an entry file if it was not analyzed before.
 * @see `doAnalyzeEntry`
 * @param ctx _reference_ Plugin's entry analysis context.
 * @param entryPath Absolute path of the entry file.
 * @param depth Static analysis' context depth.
 * @returns Execution duration.
 */
async function analyzeEntry(ctx: Context, entryPath: EntryPath, depth: number): Promise<Duration> {
  if (ctx.entries.has(entryPath)) return [0, 0];

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
 * @returns Execution duration.
 */
async function doAnalyzeEntry(
  ctx: Context,
  entryPath: EntryPath,
  depth: number,
): Promise<Duration> {
  const exportsMap: EntryExports = new Map([]);
  const wildcardExports: WildcardExports = { named: new Map([]), direct: [] };
  const diagnostics = new Set<number>();
  let exps: ExportSpecifier[] = [];
  let source = '';
  let updatedSource = '';
  let charactersDiff = 0;
  let definesExportedCode = false;
  let importsCount = 0;

  const [time, self] = await ctx.timer.time(
    `Analysis of entry "${entryPath}"`,
    async (nonselfTime) => {
      await init;
      source = await getCodeFromPath(entryPath);
      const defaultImport: ImportParams = { path: entryPath, importDefault: true };
      const analyzedImports: EntryImports = new Map([['default', defaultImport]]);
      const [imports, exportList] = parse(source);
      exps = exportList as RemoveReadonly<ExportSpecifier[]>;

      // First analyze the imported entities of the entry.
      for (const { n: path, ss: startPosition, se: endPosition } of imports) {
        const [t, s] = await methods.analyzeEntryImport(
          ctx,
          source,
          diagnostics,
          wildcardExports,
          analyzedImports,
          entryPath,
          path as string,
          startPosition,
          endPosition,
          depth,
        );

        nonselfTime += t - s;
      }

      // Then analyze the exports with the gathered data.
      exps.forEach(({ n: namedExport, ln: localName }) => {
        const definesExports = methods.analyzeEntryExport(
          entryPath,
          exportsMap,
          wildcardExports,
          analyzedImports,
          namedExport,
          localName,
        );

        if (!definesExportedCode && definesExports) {
          definesExportedCode = true;
        }
      });

      // Clean-up entry.
      const cleanedUp = methods.cleanupEntry(
        ctx,
        diagnostics,
        entryPath,
        source,
        exportsMap,
        exps,
        definesExportedCode,
      );

      importsCount += analyzedImports.size - 1;
      updatedSource = cleanedUp.updatedSource;
      charactersDiff = cleanedUp.charactersDiff;
      ctx.logger.debug(`Cleaned-up entry "${entryPath}" (-${charactersDiff} chars)`);

      return nonselfTime;
    },
  );

  // Finally export entry's analysis output.
  ctx.entries.set(entryPath, {
    hits: 0,
    importsCount,
    exports: exportsMap,
    diagnostics,
    wildcardExports,
    source,
    updatedSource,
    depth,
    time,
    self,
  });

  return [time, self];
}

/**
 * Orchestrates the cleanup of an entry file.
 * @param ctx _reference_ Plugin's entry analysis context.
 * @param diagnostics _reference_ - Indices of emitted `ctx.diagnostics` for this entry.
 * @param entryPath Absolute path of the entry file.
 * @param source Source code of the entry file.
 * @param exportsMap _reference_ - Map of entry's analyzed exports.
 * @param exps List of exports.
 * @param definesExportedCode Whether the entry file exports code it defines.
 */
function cleanupEntry(
  ctx: Context,
  diagnostics: Set<number>,
  entryPath: EntryPath,
  source: string,
  exportsMap: EntryExports,
  exps: ExportSpecifier[],
  definesExportedCode: boolean,
) {
  const diagnosticName: keyof DiagnosticsConfig = 'definedWithinEntry';
  const updatedSource = EntryCleaner.cleanupEntry(source, exportsMap, exps);
  const charactersDiff = source.length - updatedSource.length;
  const requiresDiagnostic =
    ctx.diagnostics.isEnabled(diagnosticName) &&
    definesExportedCode &&
    updatedSource.includes('import');

  if (requiresDiagnostic) {
    const diagnostic = DiagnosticKinds[diagnosticName](entryPath);
    const diagnosticCtx = { source: entryPath };
    const diagnosticIndex = ctx.diagnostics.add(diagnosticName, diagnostic.message, diagnosticCtx);
    diagnostics.add(diagnosticIndex);
  }

  ctx.logger.debug(`Cleaned-up entry "${entryPath}" (-${charactersDiff} chars)`);
  return { updatedSource, charactersDiff };
}

/**
 * Analyzes a single import statement made from an entry.
 * @param ctx Plugin's entry analysis context.
 * @param rawEntry Source code of the entry file.
 * @param diagnostics _reference_ - Indices of emitted `ctx.diagnostics` for this entry.
 * @param wildcardExports _reference_ - aught wildcard exports.
 * @param analyzedImports _reference_ - Map of analyzed imports.
 * @param entryPath Absolute path of the entry point.
 * @param path Path of the imported resource.
 * @param startPosition Import statement start position (based on rawEntry).
 * @param endPosition Import statement end position (based on rawEntry).
 * @param depth Static analysis' context depth.
 * @returns Execution duration.
 */
async function analyzeEntryImport(
  ctx: Context,
  rawEntry: string,
  diagnostics: Set<number>,
  wildcardExports: WildcardExports,
  analyzedImports: EntryImports,
  entryPath: EntryPath,
  path: string,
  startPosition: number,
  endPosition: number,
  depth: number,
): Promise<Duration> {
  return await ctx.timer.time(`Analysis of entry import"`, async (nonselfTime) => {
    const statement = rawEntry.slice(startPosition, endPosition);
    const imports = Parsers.parseImportStatement(statement);

    imports.defaultImports.forEach((defaultImport) => {
      analyzedImports.set(defaultImport, { path, importDefault: true });
    });

    if (imports.wildcardImport) {
      const method = methods.registerWildcardImportIfNeeded;
      const [t, s] = await method(ctx, diagnostics, path, entryPath, depth);
      nonselfTime += t - (s ?? 0);
      const { alias } = Parsers.parseImportParams(imports.wildcardImport);
      if (alias) {
        wildcardExports.named.set(alias, path);
      } else {
        wildcardExports.direct.push(path);
      }
    }

    imports.namedImports.forEach((namedImport) => {
      const { name, alias } = Parsers.parseImportParams(namedImport);
      analyzedImports.set(alias ?? name, {
        path,
        importDefault: false,
        originalName: name,
      });
    });

    return nonselfTime;
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
): void | true {
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

      return true;
    }
  }
}

/**
 * If the wildcard-imported module is not a target entry and the max depth
 * was not reached, registers it so that we can analyze it as an implicit
 * target to later resolve its exports.
 * @see `registerWildcardImport`
 * @param ctx Plugin's entry analysis context.
 * @param diagnostics _reference_ - Indices of emitted `ctx.diagnostics` for this entry.
 * @param path Path to the wildcard-imported module.
 * @param importedFrom Path the wildcard-imported module was imported from.
 * @param depth Static analysis' context depth.
 * @returns Execution duration.
 */
async function registerWildcardImportIfNeeded(
  ctx: Context,
  diagnostics: Set<number>,
  path: string,
  importedFrom: string,
  depth: number,
): Promise<Duration> {
  return await ctx.timer.time(`Wilcard import analysis`, async (nonselfTime) => {
    const importsEntry = ctx.targets.get(path) === 0;
    const maxDepthReached = depth >= (ctx.options.maxWildcardDepth ?? 0);

    if (maxDepthReached) {
      const diagnosticName: keyof DiagnosticsConfig = 'maxDepthReached';
      const diagnostic = DiagnosticKinds[diagnosticName](path, importedFrom);
      if (importsEntry) {
        ctx.logger.debug(diagnostic.base);
      } else {
        if (ctx.diagnostics.isEnabled(diagnosticName)) {
          const diagnosticCtx = { path, importedFrom, source: importedFrom };
          const diagnosticIndex = ctx.diagnostics.add(
            diagnosticName,
            diagnostic.message,
            diagnosticCtx,
          );
          diagnostics.add(diagnosticIndex);
          ctx.logger.debug(diagnostic.base);
        }

        return 0;
      }
    }

    const [t, s] = await methods.registerWildcardImport(ctx, path, importedFrom, depth + 1);
    return nonselfTime + t - s;
  });
}

/**
 * Registers a wildcard import/export encountered while analyzing an entry.
 * Those are added as implicit targets and analyzed like entries.
 * @param ctx Plugin's entry analysis context.
 * @param path Path to the wildcard-imported module.
 * @param importedFrom Path the wildcard-imported module was imported from.
 * @param depth Static analysis' context depth.
 * @returns Execution duration.
 */
async function registerWildcardImport(
  ctx: Context,
  path: string,
  importedFrom: string,
  depth: number,
): Promise<Duration> {
  return await ctx.timer.time('Register wildcard import', async (nonselfTime) => {
    const resolvedPath = await ctx.resolver(path, importedFrom);
    if (!resolvedPath || ctx.targets.has(resolvedPath)) return nonselfTime;
    ctx.logger.info(`Adding implicit target "${path}" because of a wildcard at "${importedFrom}"`);
    ctx.targets.set(resolvedPath, depth);
    const [t] = await methods.analyzeEntry(ctx, resolvedPath, depth);
    return nonselfTime + t;
  });
}

const methods = {
  analyzeEntries,
  analyzeEntry,
  doAnalyzeEntry,
  cleanupEntry,
  analyzeEntryImport,
  analyzeEntryExport,
  registerWildcardImportIfNeeded,
  registerWildcardImport,
};

export default methods;
