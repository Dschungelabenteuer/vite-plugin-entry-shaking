import type { PluginOption, ResolveFn } from 'vite';
import type { PluginEntries, PluginOptions, EntryData } from './types';
import type { Log } from './logger';
import { Logger } from './logger';
import { transformIfNeeded } from './transform';
import { mergeOptions } from './options';
import EntryAnalyzer from './analyze-entry';
import { parseId } from './urls';
import { JSONMap } from './serializer';

export type { PluginEntries, EntryData, Log };

export const name = 'vite-plugin-entry-shaking';

export async function createEntryShakingPlugin(userOptions: PluginOptions): Promise<PluginOption> {
  /** Final options of the plugin. */
  const options = mergeOptions(userOptions);
  /** Vite resolver. */
  let resolver: ResolveFn;
  /** Plugin's logger. */
  let logger: Logger;
  /** Registered entry files. */
  let entries: PluginEntries;

  return {
    name,
    apply: 'serve',
    enforce: 'post',

    async configResolved({ logger: loggerConfig, createResolver }) {
      resolver = createResolver();
      logger = new Logger(loggerConfig, options.debug);
      logger.info('Plugin configuration resolved');
      logger.info(`- List of merged options: ${JSON.stringify(options)}`);
      entries = await EntryAnalyzer.analyzeEntries(options.targets, resolver);
      logger.info(`- List of parsed entries: ${JSON.stringify([...entries.keys()])}`);
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

    async transform(code, id) {
      return await transformIfNeeded(id, code, entries, options, resolver, logger);
    },

    async handleHotUpdate({ file }) {
      if (entries.has(file)) {
        /** @todo log HMR re-triggering analyzis */
        await EntryAnalyzer.doAnalyzeEntry(entries, file);
      }
    },

    configureServer(server) {
      server.ws.on('debug:req', () => {
        const logs = logger?.logs ?? [];
        server.ws.send('debug:res', { logs, entries: JSONMap.stringify(entries) });
      });
    },
  };
}

export default createEntryShakingPlugin;
