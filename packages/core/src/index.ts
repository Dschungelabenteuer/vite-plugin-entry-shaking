import type { PluginOption, ResolvedConfig, Logger } from 'vite';
import { normalizePath } from 'vite';
import { globby } from 'globby';
import { join, parse, resolve } from 'path';

import type { FinalPluginOptions, PluginEntries, PluginOptions, PluginTargets } from './types';
import { paint } from './logger';
import { transformImports } from './transform';
import EntryAnalyzer from './analyze-entry';

const logPrefix = paint('cyan', `[vite:entry-shaking]`);

/** Analyzes target entry files. */
export const analyzeEntries = async (
  targets: PluginTargets,
): Promise<PluginEntries> => {
  const entries: PluginEntries = new Map([]);
  await Promise.all(
    targets.map(async (absolutePath) => {
      await EntryAnalyzer.analyzeEntry(
        entries,
        absolutePath,
      );
    }),
  );

  return entries;
};

/** Determines whether a given file should be transformed. */
export const transformRequired = (
  id: string,
  includedPaths: string[],
  options: FinalPluginOptions,
) => {
  const extension = id.split('.').pop()!;
  return includedPaths.includes(id)
    && options.extensions.includes(extension);
};

/** Merges user options with the default ones. */
export const mergeOptions = (
  userOptions: PluginOptions,
): FinalPluginOptions => ({
  extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx', 'mts'],
  include: [],
  debug: false,
  root: '.',
  ...userOptions,
  targets: userOptions.targets.map(normalizePath),
});

/** Lists all of the paths matching the `include` option. */
export const listIncluded = async (
  finalOptions: FinalPluginOptions,
): Promise<string[]> => {
  const filter = (pattern: any) => normalizePath(join(finalOptions.root, pattern));
  const include = ['!node_modules', './**/*', ...finalOptions.include];
  const includedPaths = await globby(include.map(filter));
  const resolvedPaths = includedPaths.map((path) => normalizePath(resolve(process.cwd(), path)));
  return resolvedPaths;
};

export default async function createEntryShakingPlugin(
  userOptions: PluginOptions,
): Promise<PluginOption> {
  let logger: Logger;
  let config: ResolvedConfig;
  const options = mergeOptions(userOptions);
  const entries = await analyzeEntries(options.targets);
  const includedPaths = await listIncluded(options);

  return {
    name: 'vite-plugin-entry-shaking',
    apply: 'serve',
    enforce: 'post',

    configResolved(resolvedConfig) {
      logger = resolvedConfig.logger;
      config = resolvedConfig;

      if (options.debug) {
        logger.info(`${logPrefix} List of merged options: ${JSON.stringify(options)}`);
        logger.info(`${logPrefix} List of parsed entries: Map(${JSON.stringify(Array.from(entries))})`);
        logger.info(`${logPrefix} Included ${includedPaths.length} files within the plugin scope.`);
      }
    },

    load(id) {
      const { dir, name } = parse(id);
      const altId = name === 'index' ? dir : id;
      const entryParams = entries.get(id) || entries.get(altId);
      if (entryParams) return entryParams.updatedSource;
    },

    async transform(code, id) {
      const requiresTransform = transformRequired(id, includedPaths, options);
      if (options.debug) {
        logger.info(`${logPrefix} ${requiresTransform
          ? `[MATCHED] ${id}`
          : paint('gray', `[IGNORED] ${id}`)}`);
      }

      if (requiresTransform) {
        const { targets } = options;
        const aliases = config.resolve.alias;
        return await transformImports(id, code, entries, targets, aliases);
      }
    },
  };
}
