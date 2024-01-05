import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToTests = resolve(__dirname, '../../packages/core/tests');
const pathToTestCases = resolve(pathToTests, 'cases');

export default defineConfig(async () => ({
  plugins: [
    await EntryShakingPlugin({
      targets: targets.map((target) => resolve(pathToTestCases, target)),
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

const targets = [
  './mixed-imports/mixed.ts',
  './wildcard-import-reexport/wildcard.ts',
  './wildcard-import-reexport/wildcard-one.ts',
  './named-export-direct-reexport/single.ts',
  './named-export-direct-reexport/multiple.ts',
  './named-export-import-reexport-alias-via-export/single.ts',
  './named-export-import-reexport-alias-via-export/multiple.ts',
  './named-export-import-reexport/single.ts',
  './named-export-import-reexport/multiple.ts',
  './named-export-import-reexport-alias-via-import/single.ts',
  './named-export-import-reexport-alias-via-import/multiple.ts',
  './default-export/has-default-export.ts',
  './default-export/with-default-direct-reexport.ts',
  './default-export/with-default-import-reexport.ts',
  './default-export/with-destructured-default-import.ts',
  './wildcard-export/wildcard.ts',
  './wildcard-export/wildcard-one.ts',
  './wildcard-export/wildcard-alias.ts',
  './wildcard-export/wildcard-one-alias.ts',
  './wildcard-export/wildcard-two.ts',
  './cross-entries/named-export-direct-reexport-single.ts',
  './cross-entries/named-export-direct-reexport-multiple.ts',
  './cross-entries/named-export-import-reexport-single.ts',
  './cross-entries/named-export-import-reexport-multiple.ts',
  './cross-entries/named-export-import-reexport-alias-via-export-single.ts',
  './cross-entries/named-export-import-reexport-alias-via-export-multiple.ts',
  './cross-entries/named-export-import-reexport-alias-via-import-single.ts',
  './cross-entries/named-export-import-reexport-alias-via-import-multiple.ts',
  './cross-entries/mixed-imports.ts',
  './cross-entries/default-export-has-default-export.ts',
  './cross-entries/default-export-with-default-direct-reexport.ts',
  './cross-entries/default-export-with-default-import-reexport.ts',
  './cross-entries/default-export-with-destructured-default-import.ts',
];
