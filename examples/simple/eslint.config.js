import typescriptPreset from '@yungezeit/eslint-typescript';
import globals from 'globals';

export default [
  ...typescriptPreset,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
