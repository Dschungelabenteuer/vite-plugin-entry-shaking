import type { ExportSpecifier } from 'es-module-lexer';
import MagicString from 'magic-string';

import type { EntryExports } from './types';

/**
 * Reformats remaining changed exports from updated entry file.
 * @param content Updated entry file content.
 */
const reformatRemainingExports = (content: string) =>
  content.replace(/export {([^}]*)}/gm, (_, exports: string) => {
    const reformattedExport = exports
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '')
      .join(',');

    return `export { ${reformattedExport} }`;
  });

/**
 * Removes empty exports from updated entry file.
 * @param content Updated entry file content.
 */
const removeEmptyExports = (content: string) => content.replace(/(export {[^\w}]*}.*;?)/gm, '');

/**
 * Removes resolved exports from entry file.
 * @param rawEntry Source code of the entry file.
 * @param entryMap _reference_ - Map of entry's analyzed exports.
 * @param exports List of exports.
 */
const removeResolvedExports = (
  rawEntry: string,
  entryMap: EntryExports,
  exports: readonly ExportSpecifier[],
): string => {
  const output = new MagicString(rawEntry);
  const replace = new Set<[number, number, string]>([]);
  exports.forEach(({ n: exportedName, s: lineStart, e: lineEnd }) => {
    if (entryMap.has(exportedName)) {
      replace.add([lineStart, lineEnd, '']);
    }
  });

  replace.forEach(([start, end, replacement]) => {
    output.overwrite(start, end, replacement);
  });

  return output.toString().replace(/(\w*\s*as\s*)([,}])/gm, '$2');
};

/**
 * Cleans up the entry file content by removing the extracted exports
 * and the consequently unused imports. This is required because the
 * entry point might still be imported if it exports any other thing
 * than direct re-exports (e.g. `export const Something = "value";`).
 * @param rawEntry Source code of the entry file.
 * @param entryMap _reference_ - Map of entry's analyzed exports.
 * @param exports List of exports.
 */
const cleanupEntry = (
  rawEntry: string,
  entryMap: EntryExports,
  exports: readonly ExportSpecifier[],
) =>
  methods.reformatRemainingExports(
    methods.removeEmptyExports(methods.removeResolvedExports(rawEntry, entryMap, exports)),
  );

export const methods = {
  removeResolvedExports,
  removeEmptyExports,
  reformatRemainingExports,
  cleanupEntry,
};

export default methods;
