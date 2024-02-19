import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pathToFirst = resolve(__dirname, 'src/first');
const pathToSecond = resolve(__dirname, 'src/second');

export default defineConfig(async () => ({
  plugins: [
    await EntryShakingPlugin({
      targets: [pathToFirst, pathToSecond],
      debug: true,
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@utils': pathToSecond,
      '@first': pathToFirst,
    },
  },
}));
