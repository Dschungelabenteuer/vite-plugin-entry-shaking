import type { Plugin, ResolvedConfig } from 'vite';
import type {
  Diagnostic,
  PluginMetrics,
  PluginEntries,
  PluginOptions,
  DebuggerEvents,
  EntryData,
  TransformData,
  WildcardExports,
  EntryExports,
  LogLevel,
  Log,
} from './types';

import { Context } from './context';
import { mergeOptions } from './options';
import { loadDebugger } from './utils';

export type {
  Diagnostic,
  PluginEntries,
  PluginMetrics,
  PluginOptions,
  DebuggerEvents,
  EntryData,
  TransformData,
  WildcardExports,
  EntryExports,
  LogLevel,
  Log,
  Context,
};

export { DiagnosticKinds } from './diagnostics';

export const name = 'vite-plugin-entry-shaking';

export function createEntryShakingPlugin(userOptions: PluginOptions): Plugin[] {
  /** Final options of the plugin. */
  const options = mergeOptions(userOptions);
  /** Plugin's context. */
  let context: Context;
  /** Original createResolver captured early */
  let originalCreateResolver: ResolvedConfig['createResolver'];

  return [
    {
      name: `${name}:pre`,
      apply: 'serve',
      enforce: 'pre',
      configResolved(config) {
        originalCreateResolver = config.createResolver;
      },
    },
    {
      name,
      apply: 'serve',
      enforce: 'post',

      async configResolved(config) {
        // @ts-expect-error Who hijacks last hijacks best
        config.createResolver = originalCreateResolver;
        context = new Context(options, config);
        await context.init();
      },

      async configureServer(server) {
        if (context.options.debug) {
          const { attachDebugger } = await loadDebugger();
          attachDebugger(server, context);
        }
      },

      load(id) {
        return context.loadFile(id);
      },

      async transform(code, id) {
        return await context.transformFile(code, id);
      },

      async handleHotUpdate({ file }) {
        await context.checkUpdate(file);
      },
    },
  ];
}

export default createEntryShakingPlugin;
