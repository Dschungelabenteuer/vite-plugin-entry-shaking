import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';
import vueDevTools from 'vite-plugin-vue-devtools'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToLib = resolve(__dirname, './src/lib');

export default defineConfig(() => ({
  plugins: [
    EntryShakingPlugin({
      targets: [pathToLib],
      debug: true,

    }),
    vueDevTools(),
    vue(),
  ],
  resolve: {
    alias: {
      '@lib': pathToLib,
    },
  },
}));
