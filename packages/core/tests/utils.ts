import { resolve } from 'path';
import { resolveConfig } from 'vite';

export const MOCKS_FOLDER = '__mocks__';
export const MOCK_IMPORT_INPUT = {
  path: 'some path',
  importDefault: false,
  originalName: 'some name',
  name: 'some name',
};

export const STUB_SOURCE = '';
export const STUB_PATH = '';
export const STUB_ID = '';
export const VITE_CONFIG = {
  resolve: {
    alias: {
      '@mocks/entry-a': resolve(__dirname, MOCKS_FOLDER, 'entry-a'),
      '@mocks/entry-b': resolve(__dirname, MOCKS_FOLDER, 'entry-b/index.ts'),
    },
  },
};

export const getTestResolver = async () =>
  (await resolveConfig(VITE_CONFIG, 'serve')).createResolver();
