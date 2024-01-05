import type { PluginOption } from 'vite';
import type { LogLevel, Log } from './logger';
import type {
  PluginMetrics,
  PluginEntries,
  PluginOptions,
  EntryData,
  TransformData,
  EntryExports,
  WildcardExports,
} from './types';

import { Context } from './context';
import { mergeOptions } from './options';
import { loadDebugger } from './utils';

export type {
  LogLevel,
  Log,
  PluginEntries,
  PluginMetrics,
  EntryData,
  TransformData,
  WildcardExports,
  EntryExports,
  Context,
};

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
      console.error('initialized');
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
      console.error('configureServer');
      if (context.options.debug) {
        const { attachDebugger } = await loadDebugger();
        attachDebugger(server, context);
      }
    },
  };
}

export default createEntryShakingPlugin;
