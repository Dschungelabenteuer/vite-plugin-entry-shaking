import { resolve } from 'path';
import { resolveConfig } from 'vite';

export const MOCKS_FOLDER = '__mocks__';
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
