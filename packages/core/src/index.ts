import type { ModuleNode, Plugin, ResolvedConfig } from 'vite';
import type {
  Diagnostic,
  DiagnosticsConfig,
  PluginMetrics,
  PluginEntries,
  PluginOptions,
  PluginTransforms,
  DebuggerEvents,
  EntryData,
  TransformData,
  WildcardExports,
  EntryExports,
  LogLevel,
  Log,
  ImportParams,
} from './types';

import { Context } from './context';
import { mergeOptions } from './options';
import { loadDebugger } from './utils';

export type {
  Diagnostic,
  DiagnosticsConfig,
  PluginEntries,
  PluginMetrics,
  PluginOptions,
  PluginTransforms,
  DebuggerEvents,
  EntryData,
  TransformData,
  WildcardExports,
  EntryExports,
  LogLevel,
  Log,
  Context,
  ImportParams,
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
        // Capture the original createResolver before vite-plugin-inspect hijacks it.
        originalCreateResolver = config.createResolver;
      },
    },
    {
      name,
      apply: 'serve',
      enforce: 'post',

      configResolved(config) {
        // @ts-expect-error Who hijacks last hijacks best
        config.createResolver = originalCreateResolver;
        context = new Context(options, config);
        context.hmr.includeEntriesInWatcherOptions();
      },

      async configureServer(server) {
        context.resolver.usePluginContainer(server);
        await context.init();
        context.hmr.watchEntryFiles(server.watcher);

        if (context.options.debug) {
          const { attachDebugger } = await loadDebugger();
          attachDebugger(server, context);
        }
      },

      async load(id) {
        await context.init();
        return context.loadFile(id);
      },

      async transform(code, id) {
        await context.init();
        return await context.transformFile(code, id);
      },

      async handleHotUpdate({ file, modules, server, timestamp }) {
        await context.init();
        const isEntryUpdate = await context.hmr.checkUpdate(file);

        if (!isEntryUpdate) return;

        const affectedModules = context.hmr.getHotUpdateModules(file, modules, server.moduleGraph);
        const invalidatedModules = new Set<ModuleNode>();

        for (const module of affectedModules) {
          server.moduleGraph.invalidateModule(module, invalidatedModules, timestamp, true);
        }

        // Rewritten imports bypass the entry module, so Vite cannot propagate its update
        // to every consumer through the module graph. Reload to execute the new imports.
        server.ws.send({ type: 'full-reload' });
        return [];
      },
    },
  ];
}

/** @alias */
export default createEntryShakingPlugin;
