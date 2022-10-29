import { readFileSync } from 'fs';
import { resolve } from 'path';
import { init, parse } from 'es-module-lexer';

import type { EntryExports, EntryImports, ParsedImportStatement, PluginEntries, TargetAbsolutePath } from './types';
import EntryCleaner from './cleanup-entry';

/**
 * Parses an import statement to extract default and named exports.
 * @param statement Import statement to parse.
 */
const parseImportStatement = (statement: string): ParsedImportStatement => {
  const output: ParsedImportStatement = { namedImports: [], defaultImport: null };
  let [,, importContent] = statement.match(/(im|ex)port (.*) from/) ?? [,, undefined];
  if (importContent) {
    const [namedImportsStatement, namedImportsContent] = importContent.match(/{(.*)}/) ?? [, undefined];
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
    output.defaultImport = defaultImport.length
      ? defaultImport
      : output.defaultImport;
  }

  return output;
};

/**
 * Analyzes the imports of an entry point.
 * This is required because we need to store their paths to
 * later remap named exports that rely on import statements.
 * @param rawEntry Source code of the entry file.
 * @param analyzedImports _reference_ - Map of analyzed imports.
 * @param path Path of the imported resource.
 * @param statementStartPosition Import statement start position (based on rawEntry).
 * @param statementEndPosition Import statement end position (based on rawEntry).
 */
const analyzeEntryImport = (
  rawEntry: string,
  analyzedImports: EntryImports,
  path: string,
  statementStartPosition: number,
  statementEndPosition: number,
): void => {
  const statement = rawEntry.slice(
    statementStartPosition,
    statementEndPosition,
  );

  const { namedImports, defaultImport } = methods.parseImportStatement(statement);

  if (defaultImport) {
    analyzedImports.set(defaultImport, { path, importDefault: true });
  }

  if (namedImports.length) {
    namedImports.forEach((namedImport) => {
      analyzedImports.set(namedImport, { path, importDefault: false });
    });
  }
};

/**
 * Analyzes the exports of an entry point.
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
    const { path, importDefault } = analyzedImports.get(namedExport)!;
    entryMap.set(namedExport, { path, importDefault });
    return;
  }

  const aliasStatement = Array.from(analyzedImports.keys())
    .find((key) => key.match(new RegExp(`as ${namedExport}`)));

  if (aliasStatement && analyzedImports.has(aliasStatement)) {
    const { path, importDefault } = analyzedImports.get(aliasStatement)!;
    entryMap.set(namedExport, { path, importDefault, aliasStatement });
  }
};

/**
 * Analyzes an entry file to feed a list of exports.
 * @param entries _reference_ - Map of parsed entry files.
 * @param targetAbsolutePath Absolute path of the entry point.
 */
const doAnalyzeEntry = async (
  entries: PluginEntries,
  targetAbsolutePath: TargetAbsolutePath,
): Promise<void> => {
  await init;

  const entryMap: EntryExports = new Map([]);
  const analyzedImports: EntryImports = new Map([]);
  const rawEntry = readFileSync(resolve(targetAbsolutePath, 'index.ts'), 'utf-8');
  const [imports, exports] = parse(rawEntry);

  imports.forEach(({
    n: path,
    ss: statementStartPosition,
    se: statementEndPosition,
  }) => {
    methods.analyzeEntryImport(
      rawEntry,
      analyzedImports,
      path as string,
      statementStartPosition,
      statementEndPosition,
    );
  });

  exports.forEach(({ n: namedExport }) => {
    methods.analyzeEntryExport(
      entryMap,
      analyzedImports,
      namedExport,
    );
  });

  entries.set(targetAbsolutePath, {
    exports: entryMap,
    updatedSource: EntryCleaner.cleanupEntry(
      rawEntry,
      entryMap,
      exports,
    ),
  });
};

/**
 * Analyzes an entry file to feed a list of exports, if it was not analyzed before.
 * @param entries _reference_ - Map of parsed entry files.
 * @param targetAbsolutePath Absolute path of the entry point.
 */
const analyzeEntry = async (
  entries: PluginEntries,
  targetAbsolutePath: TargetAbsolutePath,
): Promise<void> => {
  if (entries.has(targetAbsolutePath)) return;

  await methods.doAnalyzeEntry(
    entries,
    targetAbsolutePath,
  );
};

const methods = {
  parseImportStatement,
  analyzeEntryImport,
  analyzeEntryExport,
  doAnalyzeEntry,
  analyzeEntry,
};

export default methods;
