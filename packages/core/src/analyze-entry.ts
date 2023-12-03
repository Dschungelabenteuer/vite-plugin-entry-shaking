import { readFileSync } from 'fs';
import { resolve } from 'path';
import { init, parse } from 'es-module-lexer';

import type { ResolveFn } from 'vite';
import type {
  EntryExports,
  EntryImports,
  PluginEntries,
  PluginTargets,
  EntryPath,
  ImportParams,
} from './types';
import EntryCleaner from './cleanup-entry';
import Parsers from './parse';
import Utils from './utils';

/**
 * Analyzes target entry files.
 * @see `doAnalyzeEntry`
 * @param targets List of targets being processed by the plugin.
 * @param resolver Vite's resolve function.
 */
async function analyzeEntries(targets: PluginTargets, resolver: ResolveFn): Promise<PluginEntries> {
  const entries: PluginEntries = new Map([]);
  await Utils.parallelize(targets, async (path) => {
    const absolutePath = (await resolver(path)) ?? path;
    await methods.analyzeEntry(entries, absolutePath);
  });
  return entries;
}

/**
 * Analyzes an entry file if it was not analyzed before.
 * @see `doAnalyzeEntry`
 * @param entries _reference_ - Map of parsed entry files.
 * @param entryPath Absolute path of the entry point.
 */
async function analyzeEntry(entries: PluginEntries, entryPath: EntryPath): Promise<void> {
  if (entries.has(entryPath)) return;

  await methods.doAnalyzeEntry(entries, entryPath).catch(() => {
    throw new Error(`Could not analyze entry file "${entryPath}"`);
  });
}

/**
 * Analyzes an entry file and extracts information about its exports.
 * Also, it creates a cleaned-up version of an entry's source code in
 * case it still needs to be served (e.g. through unsupported syntaxes
 * or when importing code the entry actually owns).
 * @param entries _reference_ - Map of parsed entry files.
 * @param entryPath Absolute path of the entry point.
 */
async function doAnalyzeEntry(entries: PluginEntries, entryPath: EntryPath): Promise<void> {
  await init;

  const entryMap: EntryExports = new Map([]);
  const defaultImport: ImportParams = { path: entryPath, importDefault: true };
  const analyzedImports: EntryImports = new Map([['default', defaultImport]]);
  const rawEntry = readFileSync(resolve(entryPath), 'utf-8');
  const [imports, exports] = parse(rawEntry);

  // First analyze the imported entities of the entry.
  for (const { n: path, ss: startPosition, se: endPosition } of imports) {
    methods.analyzeEntryImport(
      rawEntry,
      analyzedImports,
      path as string,
      startPosition,
      endPosition,
    );
  }

  // Then analyze the exports with the gathered data.
  exports.forEach(({ n: namedExport, ln: localName }) => {
    methods.analyzeEntryExport(entryMap, analyzedImports, namedExport, localName);
  });

  // Finally export entry's analyzis output.
  entries.set(entryPath, {
    exports: entryMap,
    source: rawEntry,
    updatedSource: EntryCleaner.cleanupEntry(rawEntry, entryMap, exports),
  });
}

/**
 * Analyzes a single import statement made from an entry point.
 * This is required because we need to store their paths to
 * later remap named exports that rely on import statements.
 * @param rawEntry Source code of the entry file.
 * @param analyzedImports _reference_ - Map of analyzed imports.
 * @param path Path of the imported resource.
 * @param startPosition Import statement start position (based on rawEntry).
 * @param endPosition Import statement end position (based on rawEntry).
 */
function analyzeEntryImport(
  rawEntry: string,
  analyzedImports: EntryImports,
  path: string,
  startPosition: number,
  endPosition: number,
): void {
  const statement = rawEntry.slice(startPosition, endPosition);
  const { namedImports, defaultImports } = Parsers.parseImportStatement(statement);

  defaultImports.forEach((defaultImport) => {
    analyzedImports.set(defaultImport, { path, importDefault: true });
  });

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
 * Analyzes a single export statement made from an entry point.
 * This maps named exports to their origin paths so that we
 * can later rewrite any import statement of the entry file
 * with individual import statements to mimic tree-shaking behaviour.
 * @param entryMap _reference_ - Map of entry's analyzed exports.
 * @param analyzedImports _reference_ - Map of analyzed imports.
 * @param namedExport Name of the export e.g. (`n` in `export { ln as n }`).
 * @param localName Local name of the export e.g. (`ln` in `export { ln as n }`).
 */
function analyzeEntryExport(
  entryMap: EntryExports,
  analyzedImports: EntryImports,
  namedExport: string,
  localName?: string,
): void {
  if (namedExport) {
    if (analyzedImports.has(namedExport)) {
      const { path, importDefault, originalName } = analyzedImports.get(namedExport)!;
      entryMap.set(namedExport, { path, importDefault, originalName });
    } else if (localName && analyzedImports.has(localName)) {
      const { path, importDefault } = analyzedImports.get(localName)!;
      entryMap.set(namedExport, { path, importDefault, originalName: localName });
    }
  }
}

const methods = {
  analyzeEntries,
  analyzeEntry,
  doAnalyzeEntry,
  analyzeEntryImport,
  analyzeEntryExport,
};

export default methods;
