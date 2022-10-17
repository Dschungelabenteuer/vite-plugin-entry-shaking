import type { PluginOption, ResolvedConfig } from 'vite';
import { normalizePath } from 'vite';
import { parse } from 'path';

import type { FinalPluginOptions, PluginEntries, PluginOptions, PluginTargets } from './types';
import { transformImports } from './transform';
import EntryAnalyzer from './analyze-entry';

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
  config: ResolvedConfig,
  options: FinalPluginOptions,
) => {
  const extension = id.split('.').pop()!;
  return id.includes(config.root)
    && options.extensions.includes(extension);
};

/** Merges user options with the default ones. */
export const mergeOptions = (
  userOptions: PluginOptions,
): FinalPluginOptions => ({
  extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx', 'mts'],
  ...userOptions,
  targets: userOptions.targets.map(normalizePath),
});

export default async function createEntryShakingPlugin(
  userOptions: PluginOptions,
): Promise<PluginOption> {
  let config: ResolvedConfig;
  const options = mergeOptions(userOptions);
  const entries = await analyzeEntries(options.targets);
  return {
    name: 'vite-plugin-entry-shaking',
    enforce: 'post',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    load(id) {
      const { dir, name } = parse(id);
      const altId = name === 'index' ? dir : id;
      const entryParams = entries.get(id) || entries.get(altId);
      if (entryParams) return entryParams.updatedSource;
    },

    async transform(code, id) {
      if (config.command === 'serve' && transformRequired(id, config, options)) {
        const { targets } = options;
        const aliases = config.resolve.alias;
        return await transformImports(id, code, entries, targets, aliases);
      }
    },
  };
}
