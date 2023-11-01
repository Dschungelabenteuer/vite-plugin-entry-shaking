import type { ImportSpecifier } from 'es-module-lexer';
import MagicString from 'magic-string';
import { init, parse } from 'es-module-lexer';

import type { Logger, ResolveFn } from 'vite';
import type { FinalPluginOptions, PluginEntries } from './types';
import ImportAnalyzer from './analyze-import';
import { paint } from './logger';

/**
 * Determines whether a given file should be transformed based on plugin options.
 * @param id Resolved id of the file.
 * @param options Final plugin options.
 */
export const requiresTransform = (id: string, options: FinalPluginOptions) => {
  const extension = id.split('.').pop()!;
  const isIgnored = options.ignorePatterns.some((pattern) => id.match(pattern));
  return !isIgnored && options.extensions.includes(extension);
};

/**
 * Determines wether a target entry point is imported.
 * @param id Resolved id of the file.
 * @param imports List of imports.
 * @param entries _reference_ - Map of parsed entry files.
 * @param resolver Vite's resolve function.
 */
export const importsTargetEntry = async (
  id: string,
  imports: readonly ImportSpecifier[],
  entries: PluginEntries,
  resolver: ResolveFn,
) => {
  try {
    return await Promise.any(
      imports.map(async (importParams) => {
        const { n: importPath } = importParams;
        const resolvedPath = importPath && (await resolver(importPath, id));
        if (!resolvedPath || !entries.has(resolvedPath)) throw new Error();
        return true;
      }),
    );
  } catch (e) {
    return false;
  }
};

/**
 * Transforms imports of targeted entry files.
 * @param id Resolved id of the file.
 * @param code Source code of the file.
 * @param entries _reference_ - Map of parsed entry files.
 * @param imports File's list of parsed imports.
 * @param resolver Vite's resolve function.
 * @param logger Plugin's logger.
 */
export async function transformImports(
  id: string,
  code: string,
  entries: PluginEntries,
  imports: readonly ImportSpecifier[],
  resolver: ResolveFn,
  logger: Logger,
): Promise<string | undefined> {
  // We only need to transform file if it imports at least one of targets.
  await init;
  const src = new MagicString(code);


  for (const { n: targetPath, ss: startPosition, se: endPosition } of imports) {
    const resolvedImport = targetPath && (await resolver(targetPath, id));
    const entry = resolvedImport && entries.get(resolvedImport);
    // If the active import is one of the targets, let's analyze it.
    if (entry) {
      await ImportAnalyzer.analyzeImportStatement(
        src,
        code,
        entries,
        entry.exports,
        resolvedImport,
        startPosition,
        endPosition,
        resolver,
      );
    }
  }

  logger.info(`[MATCHED] ${id}`);
  return src.toString();
}

/**
 * Transforms imports of targeted entry files if any.
 * @param id Resolved id of the file.
 * @param code Source code of the file.
 * @param entries _reference_ - Map of parsed entry files.
 * @param resolver Vite's resolve function.
 * @param logger Plugin's logger.
 * @returns Transformed file content or undefined if it did not include relevant import.
 */
export async function transformImportsIfNeeded(
  id: string,
  code: string,
  entries: PluginEntries,
  resolver: ResolveFn,
  logger: Logger,
): Promise<string | undefined> {
  const [imports] = parse(code);

  const importsTarget = await methods.importsTargetEntry(id, imports, entries, resolver);
  if (!importsTarget) {
    logger.info(paint('gray', `[IGNORED BY ANALYZIS] ${id}`));
  } else {
    return await methods.transformImports(id, code, entries, imports, resolver, logger);
  }
}

/**
 * Transform a candidate file only if needed.
 * @param id Resolved id of the file.
 * @param code Source code of the file.
 * @param entries _reference_ - Map of parsed entry files.
 * @param options Final plugin options.
 * @param resolver Vite's resolve function.
 * @param logger Plugin's logger.
 * @returns Transformed file content or undefined if it did not require any transform.
 */
export async function transformIfNeeded(
  id: string,
  code: string,
  entries: PluginEntries,
  options: FinalPluginOptions,
  resolver: ResolveFn,
  logger: Logger,
): Promise<string | undefined> {
  const isCandidate = methods.requiresTransform(id, options);

  if (!isCandidate) {
    logger.info(paint('gray', `[IGNORED BY OPTIONS] ${id}`));
  } else {
    return await methods.transformImportsIfNeeded(id, code, entries, resolver, logger);
  }
}

const methods = {
  requiresTransform,
  importsTargetEntry,
  transformImports,
  transformImportsIfNeeded,
  transformIfNeeded,
};

export default methods;
