import type{ Alias } from 'vite';
import MagicString from 'magic-string';
import { init, parse } from 'es-module-lexer';

import type { PluginEntries, PluginTargets } from './types';
import { analyzeImport } from './analyze-import';
import resolveId from './resolve';

/**
 * Transforms files importing named exports from targeted entry files.
 * @param id Resolved id of the file.
 * @param code Source code of the file.
 * @param entries _reference_ - Map of parsed entry files.
 * @param targets List of targets.
 * @returns Transformed file content or undefined if it did not require any transform.
 */
export async function transformImports(
  id: string,
  code: string,
  entries: PluginEntries,
  targets: PluginTargets,
  aliases: Alias[],
): Promise<string | undefined> {
  const [imports] = parse(code);
  const importsTargetEntry = imports.some((imported) => targets
    .includes(resolveId(id, imported.n ?? '', aliases)));

  // We only need to transform file if it imports at least one of targets.
  if (importsTargetEntry) {
    await init;
    const src = new MagicString(code);

    imports.forEach(({
      n: targetPath,
      ss: statementStartPosition,
      se: statementEndPosition,
    }) => {
      const resolvedImport = resolveId(id, targetPath ?? '', aliases);
      // If the active import is one of the targets, let's analyze it.
      if (targetPath && targets.includes(resolvedImport) && entries.has(resolvedImport)) {
        const entry = entries.get(resolvedImport);
        if (entry) {
          analyzeImport(
            src,
            code,
            entry.exports,
            targetPath,
            resolvedImport,
            statementStartPosition,
            statementEndPosition,
          );
        }
      }
    });

    return src.toString();
  }
}
