import type { PluginOption } from 'vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

import EntryShakingPlugin from 'vite-plugin-entry-shaking';

const pathToLib = resolve(__dirname, 'src/lib');
let requestCount = 0;
let disabled = false;

const countRequestPlugin = (): PluginOption => ({
  name: 'vite-count-request-plugin',
  configResolved(config) {
    disabled = !config.plugins.find((plugin) => plugin.name === 'vite-plugin-entry-shaking');
  },
  configureServer(server) {
    server.ws.on('count-request:fetch', () => {
      server.ws.send('count-request:refresh', { requestCount, disabled });
    });
  },
  load() {
    requestCount += 1;
  },
});

export default defineConfig(async () => ({
  resolve: {
    alias: {
      '@lib': pathToLib,
    },
  },
  plugins: [
    await EntryShakingPlugin({
      targets: [pathToLib],
    }),
    countRequestPlugin(),
  ],
}));
