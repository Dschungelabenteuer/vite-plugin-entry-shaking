import type { PluginOption, ResolvedConfig, Logger } from 'vite';
import { normalizePath } from 'vite';
import { parse } from 'path';

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
  options: FinalPluginOptions,
) => {
  const extension = id.split('.').pop()!;
  const isIgnored = options.ignorePatterns.some((pattern) => id.match(pattern));
  return !isIgnored && options.extensions.includes(extension);
};

/** Merges user options with the default ones. */
export const mergeOptions = (
  userOptions: PluginOptions,
): FinalPluginOptions => ({
  extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx', 'mts'],
  ignorePatterns: [/node_modules/, ...userOptions.ignorePatterns ?? []],
  debug: false,
  ...userOptions,
  targets: userOptions.targets.map(normalizePath),
});

export default async function createEntryShakingPlugin(
  userOptions: PluginOptions,
): Promise<PluginOption> {
  let logger: Logger;
  let config: ResolvedConfig;
  const options = mergeOptions(userOptions);
  const entries = await analyzeEntries(options.targets);

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
      }
    },

    load(id) {
      const { dir, name } = parse(id);
      const altId = name === 'index' ? dir : id;
      const entryParams = entries.get(id) || entries.get(altId);
      if (entryParams) return entryParams.updatedSource;
    },

    async transform(code, id) {
      const requiresTransform = transformRequired(id, options);
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
