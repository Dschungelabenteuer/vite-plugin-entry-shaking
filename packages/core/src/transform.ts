import type { ExportSpecifier, ImportSpecifier } from 'es-module-lexer';
import MagicString from 'magic-string';
import { init, parse } from 'es-module-lexer';

import type { Context } from './context';
import ImportAnalyzer from './analyze-import';
import { getCode } from './utils';

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
  const { out, time } = await ctx.timer.measure(
    'Transforming file if needed',
    async () => {
      if (!isCandidate) {
        ctx.logger.debug(`Ignored by options: ${id}`, undefined);
      } else {
        const source = await getCode(code, id);
        return await methods.transformImportsIfNeeded(ctx, id, source);
      }
    },
    true,
  );

  ctx.eventBus?.emit('increaseProcessTime', time);
  ctx.eventBus?.emit('increaseTransformTime', time);
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

  let potentialRequestsAvoided = 0;
  const importedEntries = await methods.getEntryImports(ctx, id, imports);
  const entriesMatched = importedEntries.length;
  const { transformImports: transform } = methods;
  if (!entriesMatched) {
    const ignoredMessage = `Did not transform "${id}" because it does not import any registered target`;
    ctx.logger.debug(ignoredMessage, undefined);
    return;
  }

  importedEntries.forEach((entry) => {
    potentialRequestsAvoided += ctx.entries.get(entry)?.importsCount ?? 0;
    ctx.eventBus?.emit('increaseEntryHits', entry);
  });

  const { time, out } = await ctx.timer.measure(
    `Transforming file "${id}"`,
    async () => await transform(ctx, id, code, imports, exports),
  );

  ctx.eventBus?.emit('registerTransform', {
    id,
    source: code,
    transformed: out ?? code,
    time,
    timestamp: Date.now(),
    entriesMatched,
    potentialRequestsAvoided,
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
  exports: readonly ExportSpecifier[],
): Promise<string | undefined> {
  // We only need to transform file if it imports at least one of targets.
  await init;
  const src = new MagicString(code);
  const reexports = createReexportStatement(exports);

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
  const out = src.toString();
  return reexports.length ? [out, reexports].join('\n') : out;
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
export async function getEntryImports(
  ctx: Context,
  id: string,
  imports: readonly ImportSpecifier[],
): Promise<string[]> {
  try {
    return await imports.reduce(
      async (out, importParams) => {
        const { n: importPath } = importParams;
        const resolvedPath = importPath && (await ctx.resolver(importPath, id));
        if (resolvedPath && ctx.entries.has(resolvedPath)) (await out).push(resolvedPath);
        return out;
      },
      Promise.resolve([] as string[]),
    );
  } catch (e) {
    return [];
  }
}

/**
 * Creates a statement to reexport named imports.
 * @param exports List of exports extracted by es-module-lexer.
 */
export function createReexportStatement(exports: readonly ExportSpecifier[]) {
  const namedExports = exports
    .filter((e) => e.n !== undefined && e.n !== 'default' && e.ln === undefined)
    .map(({ n }) => n);
  if (namedExports.length === 0) return '';
  return `export { ${namedExports.join(',')} };`;
}

const methods = {
  transformIfNeeded,
  transformImportsIfNeeded,
  transformImports,
  requiresTransform,
  getEntryImports,
  createReexportStatement,
};

export default methods;
