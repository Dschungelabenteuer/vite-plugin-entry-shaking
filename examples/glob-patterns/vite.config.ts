import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToLib = resolve(__dirname, './src/lib');
const pathToEntries = resolve(__dirname, './src/entries');

export default defineConfig(async () => ({
  plugins: [
    EntryShakingPlugin({
      targets: [
        pathToLib,
        {
          glob: 'src/entries/**/*.ts',
          globOptions: { ignore: ['**/node_modules/**', '**/baz.ts'] },
        },
      ],
      debug: true,
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@lib': pathToLib,
      '@entries': pathToEntries,
    },
  },
}));
