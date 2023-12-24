import type { PluginOption } from 'vite';
import type { LogLevel, Log } from './logger';
import type {
  PluginEntries,
  PluginOptions,
  EntryData,
  EntryExports,
  WildcardExports,
} from './types';

import { Context } from './context';
import { mergeOptions } from './options';

export type { LogLevel, Log, PluginEntries, EntryData, WildcardExports, EntryExports, Context };

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
