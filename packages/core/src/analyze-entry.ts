import { readFileSync } from 'fs';
import { resolve } from 'path';
import { init, parse } from 'es-module-lexer';

import type { ResolveFn } from 'vite';
import { globSync } from 'fast-glob';
import type {
  EntryExports,
  EntryImports,
  ParsedImportStatement,
  PluginEntries,
  PluginTargets,
  EntryPath,
  EntryTarget,
} from './types';
import EntryCleaner from './cleanup-entry';
import ImportAnalyzer from './analyze-import';

/**
 * Parses an import statement to extract default and named exports.
 * @param statement Import statement to parse.
 */
const parseImportStatement = (statement: string): ParsedImportStatement => {
  const output: ParsedImportStatement = {
    namedImports: [],
    defaultImport: null,
  };
  let [, , importContent] = statement.match(/(im|ex)port (.*) from/) ?? [, , undefined];
  if (importContent) {
    const [namedImportsStatement, namedImportsContent] = importContent.match(/{(.*)}/) ?? [
      ,
      undefined,
    ];
    if (namedImportsStatement && namedImportsContent) {
      importContent = importContent.replace(namedImportsStatement, '');
      namedImportsContent.split(',').forEach((namedImport) => {
        const name = namedImport.split(' as ')!.map((param) => param.trim());
        if (name.length === 1) {
          output.namedImports.push(name[0]);
        } else {
          const [originalName, alias] = name;
          if (originalName === 'default') {
            output.defaultImport = alias;
          } else {
            output.namedImports.push(namedImport.trim());
          }
        }
      });
    }

    const defaultImport = importContent.replace(/,/g, '').trim();
    output.defaultImport = defaultImport.length ? defaultImport : output.defaultImport;
  }

  return output;
};

/**
 * Analyzes an import of an entry point.
 * This is required because we need to store their paths to
 * later remap named exports that rely on import statements.
 * @param rawEntry Source code of the entry file.
 * @param analyzedImports _reference_ - Map of analyzed imports.
 * @param path Path of the imported resource.
 * @param startPosition Import statement start position (based on rawEntry).
 * @param endPosition Import statement end position (based on rawEntry).
 */
const analyzeEntryImport = (
  rawEntry: string,
  analyzedImports: EntryImports,
  path: string,
  startPosition: number,
  endPosition: number,
): void => {
  const statement = rawEntry.slice(startPosition, endPosition);

  const { namedImports, defaultImport } = methods.parseImportStatement(statement);

  if (defaultImport) {
    analyzedImports.set(defaultImport, { path, importDefault: true });
  }

  if (namedImports.length) {
    namedImports.forEach((namedImport) => {
      const { name, alias } = ImportAnalyzer.getImportParams(namedImport);
      analyzedImports.set(alias ?? name, {
        path,
        importDefault: false,
        originalName: name,
      });
    });
  }
};

/**
 * Analyzes an export of an entry point.
 * This maps named exports to their origin paths so that we
 * can later rewrite any import statement of the entry file
 * with individual import statements to mimic tree-shaking behaviour.
 * @param entryMap _reference_ - Map of entry's analyzed exports.
 * @param analyzedImports _reference_ - Map of analyzed imports.
 * @param namedExport Name of the export.
 */
const analyzeEntryExport = (
  entryMap: EntryExports,
  analyzedImports: EntryImports,
  namedExport: string,
): void => {
  if (namedExport && analyzedImports.has(namedExport)) {
    const { path, importDefault, originalName } = analyzedImports.get(namedExport)!;
    entryMap.set(namedExport, { path, importDefault, originalName });
  }
};

/**
 * Analyzes an entry file to feed a list of exports.
 * @param entries _reference_ - Map of parsed entry files.
 * @param entryPath Absolute path of the entry point.
 */
const doAnalyzeEntry = async (entries: PluginEntries, entryPath: EntryPath): Promise<void> => {
  await init;

  const entryMap: EntryExports = new Map([]);
  const analyzedImports: EntryImports = new Map([]);
  const rawEntry = readFileSync(resolve(entryPath), 'utf-8');
  const [imports, exports] = parse(rawEntry);

  // First analyze the imported entities of the entry.
  imports.forEach(({ n: path, ss: startPosition, se: endPosition }) => {
    methods.analyzeEntryImport(
      rawEntry,
      analyzedImports,
      path as string,
      startPosition,
      endPosition,
    );
  });

  // Then analyze the exports with the gathered data.
  exports.forEach(({ n: namedExport }) => {
    methods.analyzeEntryExport(entryMap, analyzedImports, namedExport);
  });

  // Finally export entry's analyzis output.
  entries.set(entryPath, {
    exports: entryMap,
    source: rawEntry,
    updatedSource: EntryCleaner.cleanupEntry(rawEntry, entryMap, exports),
  });
};

/**
 * Analyzes an entry file to feed a list of exports, if it was not analyzed before.
 * @param entries _reference_ - Map of parsed entry files.
 * @param entryPath Absolute path of the entry point.
 */
const analyzeEntry = async (entries: PluginEntries, entryPath: EntryPath): Promise<void> => {
  if (entries.has(entryPath)) return;

  await methods.doAnalyzeEntry(entries, entryPath).catch(() => {
    throw new Error(`Could not analyze entry file "${entryPath}"`);
  });
};
/**
 * @description Default Glob Options,see https://github.com/mrmlnc/fast-glob#options-3
 */
const defaultGlobOptions = { ignore: ['**/node_modules/**'] };

/**
 * Analyzes target entry files.
 * @param targets List of targets being processed by the plugin.
 * @param resolver Vite's resolve function.
 */
const analyzeEntries = async (
  targets: PluginTargets,
  resolver: ResolveFn,
): Promise<PluginEntries> => {
  const entries: PluginEntries = new Map([]);
  await Promise.all(
    targets.map(async (target: EntryTarget) => {
      const paths: string[] = [];
      if (typeof target === 'string') paths.push(target);

      if (typeof target !== 'string') {
        if (!target.path && !target.glob) {
          throw new Error('The target has at least one attribute [glob | path]');
        }
        if (target.path) paths.push(target.path);

        const options = Object.assign(
          defaultGlobOptions,
          target.globOptions ? target.globOptions : {},
        );

        if (target.glob) paths.push(...globSync(target.glob, options));
      }

      for (const path of paths) {
        const absolutePath = (await resolver(path)) ?? path;
        await methods.analyzeEntry(entries, absolutePath);
      }
    }),
  );
  return entries;
};

const methods = {
  parseImportStatement,
  analyzeEntryImport,
  analyzeEntryExport,
  doAnalyzeEntry,
  analyzeEntry,
  analyzeEntries,
};

export default methods;
