import { normalizePath } from 'vite';
import type { PluginOption } from 'vite';

const pluginName = 'vite-plugin-entry-shaking';

export function debugPlugin(dir: string): PluginOption {
  const rootDir = normalizePath(dir);
  let requestCount = 0;
  let disabled = false;

  return {
    name: `${pluginName}-request-plugin`,
    configResolved(config) {
      disabled = !config.plugins.find((plugin) => plugin.name === pluginName);
    },
    configureServer(server) {
      server.ws.on('example-debug:req', () => {
        server.ws.send('example-debug:res', { requestCount, rootDir, disabled });
      });
    },
    load(id) {
      if (!id.includes('vite-plugin-entry-shaking/examples/_shared_')) requestCount += 1;
    },
  };
}
