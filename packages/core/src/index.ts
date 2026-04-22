import type { ModuleNode, Plugin, ResolvedConfig, ViteDevServer } from 'vite';
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
      },

      async configureServer(server) {
        const fallbackResolver = context.resolver;
        const { pluginContainer } = server as Partial<ViteDevServer>;

        if (pluginContainer) {
          context.setResolver(async (id, importer, aliasOnly, ssr) => {
            if (aliasOnly) return await fallbackResolver(id, importer, aliasOnly, ssr);

            const resolved = await pluginContainer.resolveId(id, importer, { ssr });
            if (resolved) return typeof resolved === 'string' ? resolved : resolved.id;

            return await fallbackResolver(id, importer, aliasOnly, ssr);
          });
        }

        await context.init();
        context.watchEntryFiles(server.watcher);

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
        const isEntryUpdate = await context.checkUpdate(file);

        if (!isEntryUpdate) return;

        const affectedModules = context.getHotUpdateModules(file, modules, server.moduleGraph);
        const invalidatedModules = new Set<ModuleNode>();

        for (const module of affectedModules) {
          server.moduleGraph.invalidateModule(module, invalidatedModules, timestamp, true);
        }

        // Import rewrites can remove the graph edge from consumers back to the entry.
        server.ws.send({ type: 'full-reload' });
        return [];
      },
    },
  ];
}

export default createEntryShakingPlugin;
