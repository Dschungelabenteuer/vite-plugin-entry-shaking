import type { PluginOption, Logger, ResolveFn } from 'vite';
import type { PluginEntries, PluginOptions } from './types';
import { configureLogger } from './logger';
import { transformIfNeeded } from './transform';
import { mergeOptions } from './options';
import EntryAnalyzer from './analyze-entry';

export default async function createEntryShakingPlugin(
  userOptions: PluginOptions,
): Promise<PluginOption> {
  const options = mergeOptions(userOptions);
  let logger: Logger;
  let resolver: ResolveFn;
  let entries: PluginEntries;

  return {
    name: 'vite-plugin-entry-shaking',
    apply: 'serve',
    enforce: 'post',

    async configResolved({ logger: loggerConfig, createResolver }) {
      logger = configureLogger(loggerConfig, options.debug);
      resolver = createResolver();
      entries = await EntryAnalyzer.analyzeEntries(options.targets, resolver);
      logger.info(`List of merged options: ${JSON.stringify(options)}`);
      logger.info(`List of parsed entries: ${JSON.stringify([...entries.keys()])}`);
    },

    async transform(code, id) {
      return await transformIfNeeded(
        id,
        code,
        entries,
        options,
        resolver,
        logger,
      );
    },

    load(id) {
      if (entries.has(id)) {
        logger.info(`Serving mutated entry file ${id}`);
        return entries.get(id)!.updatedSource;
      }
    },
  };
}
