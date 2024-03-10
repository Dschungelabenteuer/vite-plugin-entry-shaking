import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToWithImport = resolve(__dirname, './src/with-import');
const pathToWithoutImport = resolve(__dirname, './src/without-import');

export default defineConfig(async () => ({
  plugins: [
    await EntryShakingPlugin({
      targets: [pathToWithImport, pathToWithoutImport],
      debug: true,
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@with-import': pathToWithImport,
      '@without-import': pathToWithoutImport,
    },
  },
}));
