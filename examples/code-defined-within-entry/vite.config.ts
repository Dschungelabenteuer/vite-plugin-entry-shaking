import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToMaxDepth = resolve(__dirname, './src/max-depth');
const pathToWithImport = resolve(__dirname, './src/with-import');
const pathToWithoutImport = resolve(__dirname, './src/without-import');

export default defineConfig(() => ({
  plugins: [
    EntryShakingPlugin({
      targets: [pathToMaxDepth, pathToWithImport, pathToWithoutImport],
      debug: true,
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@max-depth': pathToMaxDepth,
      '@with-import': pathToWithImport,
      '@without-import': pathToWithoutImport,
    },
  },
}));
