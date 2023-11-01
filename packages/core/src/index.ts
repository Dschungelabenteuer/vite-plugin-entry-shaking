import type { PluginOption, Logger, ResolveFn } from 'vite';
import type { PluginEntries, PluginOptions } from './types';
import { configureLogger } from './logger';
import { transformIfNeeded } from './transform';
import { mergeOptions } from './options';
import EntryAnalyzer from './analyze-entry';
import { parseId } from './urls';

export async function createEntryShakingPlugin(userOptions: PluginOptions): Promise<PluginOption> {
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

    async handleHotUpdate({ file }) {
      if (entries.has(file)) {
        await EntryAnalyzer.doAnalyzeEntry(entries, file);
      }
    },

    async transform(code, id) {
      return await transformIfNeeded(id, code, entries, options, resolver, logger);
    },

    load(id) {
      const { url, serveSource } = parseId(id);
      const entry = entries.get(url);

      if (entry) {
        const version = serveSource ? 'original' : 'mutated';
        const output = serveSource ? entry.source : entry.updatedSource;
        logger.info(`Serving ${version} entry file ${url}`);
        return output;
      }
    },
  };
}

export default createEntryShakingPlugin;
