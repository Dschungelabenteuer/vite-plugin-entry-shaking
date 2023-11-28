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
      logger = new Logger(loggerConfig, options.debug);
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

    configureServer(server) {
      server.ws.on('debug:req', () => {
        const logs = logger?.logs ?? [];
        server.ws.send('debug:res', { logs, entries: JSONMap.stringify(entries) });
      });
    },
  };
}

export default createEntryShakingPlugin;
