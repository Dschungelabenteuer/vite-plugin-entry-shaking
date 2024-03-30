import type { ExportSpecifier } from 'es-module-lexer';
import MagicString from 'magic-string';

import type { EntryExports } from './types';

/**
 * Cleans up the entry file content by removing the extracted exports
 * and the consequently unused imports. This is required because the
 * entry point might still be imported if it exports any other thing
 * than direct re-exports (e.g. `export const Something = "value";`).
 * @param rawEntry Source code of the entry file.
 * @param entryMap _reference_ - Map of entry's analyzed exports.
 * @param exps List of exports.
 */
export function cleanupEntry(
  rawEntry: string,
  entryMap: EntryExports,
  exps: readonly ExportSpecifier[],
) {
  return methods.reformatRemainingExports(
    methods.removeEmptyExports(methods.removeResolvedExports(rawEntry, entryMap, exps)),
  );
}

/**
 * Reformats remaining changed exports from updated entry file.
 * @param content Updated entry file content.
 */
export function reformatRemainingExports(content: string) {
  return content.replace(/export {([^}]*)}/gm, (_, exps: string) => {
    const reformattedExport = exps
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '')
      .join(',');

    return `export { ${reformattedExport} }`;
  });
}

/**
 * Removes empty exports from updated entry file.
 * @param content Updated entry file content.
 */
const removeEmptyExports = (content: string) => content.replace(/(export {[^\w}]*}.*;?)/gm, '');

/**
 * Removes resolved exports from entry file.
 * @param rawEntry Source code of the entry file.
 * @param entryMap _reference_ - Map of entry's analyzed exports.
 * @param exps List of exports.
 */
export function removeResolvedExports(
  rawEntry: string,
  entryMap: EntryExports,
  exps: readonly ExportSpecifier[],
): string {
  type ReplacementData = [number, number, string];
  const output = new MagicString(rawEntry);
  const replace = new Set<ReplacementData>([]);
  exps.forEach(({ n: exportedName, s: lineStart, e: lineEnd }) => {
    const exported = entryMap.get(exportedName);
    if (exported && !exported.selfDefined && exportedName !== 'default') {
      replace.add([lineStart, lineEnd, '']);
    }
  });

  replace.forEach(([start, end, replacement]) => {
    output.overwrite(start, end, replacement);
  });

  return output.toString().replace(/(\w*\s*as\s*)([,}])/gm, '$2');
}

export const methods = {
  cleanupEntry,
  reformatRemainingExports,
  removeEmptyExports,
  removeResolvedExports,
};

export default methods;
