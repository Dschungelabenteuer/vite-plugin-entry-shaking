import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToLib = resolve(__dirname, './src/lib');

export default defineConfig(async () => ({
  plugins: [
    EntryShakingPlugin({
      targets: [pathToLib],
      extensions: ['vue', 'ts', 'js'],
      debug: true,
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@lib': pathToLib,
    },
  },
}));
