import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';
import { debugPlugin } from '../_shared_/vite.plugins';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToLib = resolve(__dirname, './src/lib');

export default defineConfig(async () => ({
  plugins: [
    await EntryShakingPlugin({
      targets: [pathToLib],
      debug: true,
    }),
    debugPlugin(__dirname),
    vue(),
  ],
  resolve: {
    alias: {
      '@shared/styles': resolve(__dirname, '../_shared_/src/styles'),
      '@shared/lib': resolve(__dirname, '../_shared_/src/index.ts'),
      '@lib': pathToLib,
    },
  },
}));
