import type { ExportSpecifier, ImportSpecifier } from 'es-module-lexer';
import MagicString from 'magic-string';
import { init, parse } from 'es-module-lexer';

import type { Context } from './context';
import ImportAnalyzer from './analyze-import';

/**
 * Transforms a candidate file only if needed.
 * @param ctx _reference_ Plugin context.
 * @param id Resolved id of the file.
 * @param code Source code of the file.
 * @returns Transformed file content or undefined if it did not require any transform.
 */
export async function transformIfNeeded(
  ctx: Context,
  id: string,
  code: string,
): Promise<string | undefined> {
  ctx.logger.debug(`Processing file "${id}"`, undefined);
  const isCandidate = methods.requiresTransform(ctx, id);
  const { out, time } = await ctx.measure(
    'Transforming file if needed',
    async () => {
      if (!isCandidate) {
        ctx.logger.debug(`Ignored by options: ${id}`, undefined);
      } else {
        return await methods.transformImportsIfNeeded(ctx, id, code);
      }
    },
    true,
  );

  ctx.eventBus?.emit('increaseProcessTime', time);
  return out;
}

/**
 * Transforms imports of targeted entry files if any.
 * @param ctx _reference_ Plugin context.
 * @param id Resolved id of the file.
 * @param code Source code of the file.
 * @returns Transformed file content or undefined if it did not include relevant import.
 */
export async function transformImportsIfNeeded(
  ctx: Context,
  id: string,
  code: string,
): Promise<string | undefined> {
  const [imports, exports] = parse(code);
  const importedStr = `${imports.length} imports`;
  const exportedStr = `${exports.length} exports`;
  ctx.logger.debug(`es-module-lexer returned ${importedStr} and ${exportedStr} for "${id}"`);

  const importsTarget = await methods.importsTargetEntry(ctx, id, imports);
  const { transformImports: transform } = methods;
  if (!importsTarget) {
    ctx.logger.debug(
      `Did not transform "${id}" because it does not import any registered target`,
      undefined,
    );
    return;
  }

  const { time, out } = await ctx.measure(
    `Transforming file "${id}"`,
    async () => await transform(ctx, id, code, imports),
  );

  ctx.eventBus?.emit('registerTransform', {
    id,
    source: code,
    transformed: out ?? code,
    time,
    timestamp: Date.now(),
  });

  return out;
}

/**
 * Transforms imports of targeted entry files.
 * @param ctx _reference_ Plugin context.
 * @param id Resolved id of the file.
 * @param code Source code of the file.
 * @param imports File's list of parsed imports.
 * @param exports File's list of parsed exports.
 */
export async function transformImports(
  ctx: Context,
  id: string,
  code: string,
  imports: readonly ImportSpecifier[],
): Promise<string | undefined> {
  // We only need to transform file if it imports at least one of targets.
  await init;
  const src = new MagicString(code);

  // Analyze the imported entities of the file.
  for (const { n: path, ss: startPosition, se: endPosition } of imports) {
    const resolvedImport = path && (await ctx.resolver(path, id));
    const entry = resolvedImport && ctx.entries.get(resolvedImport);
    // If the active import is one of the targets, let's analyze it.
    if (entry) {
      await ImportAnalyzer.analyzeImportStatement(
        ctx,
        src,
        code,
        entry,
        resolvedImport,
        startPosition,
        endPosition,
      );
    }
  }

  return src.toString();
}

/**
 * Determines whether a given file should be transformed based on plugin options.
 * @param ctx _reference_ Plugin context.
 * @param id Resolved id of the file.
 */
export function requiresTransform(ctx: Context, id: string) {
  const extension = id.split('.').pop()!;
  const isIgnored = ctx.options.ignorePatterns.some((pattern) => id.match(pattern));
  return !isIgnored && ctx.options.extensions.includes(extension);
}

/**
 * Determines whether a target entry point is imported.
 * @param ctx _reference_ Plugin context.
 * @param id Resolved id of the file.
 * @param imports List of imports.
 */
export async function importsTargetEntry(
  ctx: Context,
  id: string,
  imports: readonly ImportSpecifier[],
) {
  try {
    return await Promise.any(
      imports.map(async (importParams) => {
        const { n: importPath } = importParams;
        const resolvedPath = importPath && (await ctx.resolver(importPath, id));
        if (!resolvedPath || !ctx.entries.has(resolvedPath)) throw new Error();
        return true;
      }),
    );
  } catch (e) {
    return false;
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
  transformIfNeeded,
  transformImportsIfNeeded,
  transformImports,
  requiresTransform,
  importsTargetEntry,
  createReexportStatement,
};

export default methods;
