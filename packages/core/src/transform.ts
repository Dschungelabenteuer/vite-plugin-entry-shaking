import type { ExportSpecifier, ImportSpecifier } from 'es-module-lexer';
import MagicString from 'magic-string';
import { init, parse } from 'es-module-lexer';

import type { ResolveFn } from 'vite';
import type { FinalPluginOptions, PluginEntries } from './types';
import type { Logger } from './logger';
import ImportAnalyzer from './analyze-import';

/**
 * Determines whether a given file should be transformed based on plugin options.
 * @param id Resolved id of the file.
 * @param options Final plugin options.
 */
export function requiresTransform(id: string, options: FinalPluginOptions) {
  const extension = id.split('.').pop()!;
  const isIgnored = options.ignorePatterns.some((pattern) => id.match(pattern));
  return !isIgnored && options.extensions.includes(extension);
}

/**
 * Determines whether a target entry point is imported.
 * @param id Resolved id of the file.
 * @param imports List of imports.
 * @param entries _reference_ - Map of parsed entry files.
 * @param resolver Vite's resolve function.
 */
export async function importsTargetEntry(
  id: string,
  imports: readonly ImportSpecifier[],
  entries: PluginEntries,
  resolver: ResolveFn,
) {
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
}

/**
 * Transforms imports of targeted entry files.
 * @param id Resolved id of the file.
 * @param code Source code of the file.
 * @param entries _reference_ - Map of parsed entry files.
 * @param imports File's list of parsed imports.
 * @param exports File's list of parsed exports.
 * @param resolver Vite's resolve function.
 * @param logger Plugin's logger.
 */
export async function transformImports(
  id: string,
  code: string,
  entries: PluginEntries,
  imports: readonly ImportSpecifier[],
  exports: readonly ExportSpecifier[],
  resolver: ResolveFn,
  logger: Logger,
): Promise<string | undefined> {
  // We only need to transform file if it imports at least one of targets.
  await init;
  const src = new MagicString(code);
  const reexports = createReexportStatement(exports);

  // Analyze the imported entities of the file.
  for (const { n: path, ss: startPosition, se: endPosition } of imports) {
    const resolvedImport = path && (await resolver(path, id));
    const entry = resolvedImport && entries.get(resolvedImport);
    // If the active import is one of the targets, let's analyze it.
    if (entry) {
      await ImportAnalyzer.analyzeImportStatement(
        src,
        code,
        entries,
        entry,
        resolvedImport,
        startPosition,
        endPosition,
        resolver,
      );
    }
  }
  logger.info(`[MATCHED] ${id}`);
  const out = src.toString();
  return reexports.length ? [out, reexports].join('\n') : out;
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
  const [imports, exports] = parse(code);
  const importsTarget = await methods.importsTargetEntry(id, imports, entries, resolver);
  const { transformImports: transform } = methods;
  if (importsTarget) return await transform(id, code, entries, imports, exports, resolver, logger);
  logger.info(`Ignored by analysis: ${id}`, undefined, true);
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
    logger.info(`Ignored by options: ${id}`, undefined, true);
  } else {
    return await methods.transformImportsIfNeeded(id, code, entries, resolver, logger);
  }
}

/**
 * Creates a statement to reexport named imports.
 * @param exports List of exports extracted by es-module-lexer.
 */
export function createReexportStatement(exports: readonly ExportSpecifier[]) {
  const namedExports = exports.map(({ n }) => n).filter(Boolean);
  if (namedExports.length === 0) return '';
  return `export { ${namedExports.join(',')} };`;
}

const methods = {
  requiresTransform,
  importsTargetEntry,
  transformImports,
  transformImportsIfNeeded,
  transformIfNeeded,
  createReexportStatement,
};

export default methods;
