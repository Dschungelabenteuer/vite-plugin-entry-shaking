import { resolve } from 'path';
import type { PluginOption } from 'vite';
import { defineConfig } from 'vite';

import EntryShakingPlugin from 'vite-plugin-entry-shaking';

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

const pathToFirst = resolve(__dirname, 'src/first');
const pathToSecond = resolve(__dirname, 'src/second');

export default defineConfig(async () => ({
  resolve: {
    alias: {
      '@utils': pathToSecond,
      '@first': pathToFirst,
    },
  },
  plugins: [
    await EntryShakingPlugin({
      targets: [pathToFirst, pathToSecond],
    }),
    countRequestPlugin(),
  ],
}));
