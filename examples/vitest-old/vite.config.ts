/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToUtil = resolve(__dirname, './src/util');

export default defineConfig(async () => ({
  plugins: [
    // await EntryShakingPlugin({
    //   targets: [pathToUtil],
    //   debug: true,
    // }),
    vue(),
  ],
  resolve: {
    alias: {
      '@util': pathToUtil,
    },
  },
}));
