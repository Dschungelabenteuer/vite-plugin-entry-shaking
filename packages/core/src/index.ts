import type { PluginOption } from 'vite';
import type { PluginEntries, PluginOptions, EntryData } from './types';
import type { Log } from './logger';
import { mergeOptions } from './options';
import { JSONMap } from './serializer';
import { Context } from './context';

export type { PluginEntries, EntryData, Log };

export const name = 'vite-plugin-entry-shaking';

export async function createEntryShakingPlugin(userOptions: PluginOptions): Promise<PluginOption> {
  /** Final options of the plugin. */
  const options = mergeOptions(userOptions);
  /** Plugin's context. */
  let context: Context;

  return {
    name,
    apply: 'serve',
    enforce: 'post',

    async configResolved(config) {
      context = new Context(options, config);
      await context.init();
    },

    load(id) {
      return context.loadFile(id);
    },

    async transform(code, id) {
      return await context.transformFile(code, id);
    },

    async handleHotUpdate({ file }) {
      await context.updateFile(file);
    },

    configureServer(server) {
      server.ws.on('debug:req', () => {
        const logs = context.logger?.logs ?? [];
        server.ws.send('debug:res', { logs, entries: JSONMap.stringify(context.entries) });
      });
    },
  };
}

export default createEntryShakingPlugin;
