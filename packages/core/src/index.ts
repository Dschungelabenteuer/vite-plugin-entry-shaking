import type { PluginOption } from 'vite';
import type { PluginEntries, PluginOptions, EntryData } from './types';
import type { Log } from './logger';
import { mergeOptions } from './options';
import { Context } from './context';

export type { PluginEntries, EntryData, Context, Log };

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

    async configureServer(server) {
      if (context.options.debug) {
        const { attachDebugger } = await import('vite-plugin-entry-shaking-debugger');
        attachDebugger(server, context);
      }
    },
  };
}

export default createEntryShakingPlugin;
