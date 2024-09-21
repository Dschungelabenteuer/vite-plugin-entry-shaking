import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';
import targets from './entries.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');
const pathToTests = resolve(__dirname, './src/data/');
const pathToTestCases = resolve(pathToTests, 'cases');

export default defineConfig(async () => ({
  plugins: [
    EntryShakingPlugin({
      targets: targets.map((target) => resolve(rootDir, target)),
      enableDiagnostics: true,
      maxWildcardDepth: 1,
      debug: true,
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@mocks': resolve(pathToTests, '__mocks__'),
      '@test-modules': resolve(pathToTests, '__mocks__/modules'),
      '@test-cases': pathToTestCases,
    },
  },
}));
