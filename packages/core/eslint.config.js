import typescriptPreset from '@yungezeit/eslint-typescript';
import globals from 'globals';

export default [
  ...typescriptPreset,
  { ignores: ['dist', 'coverage', 'README.md'] },
  {
    files: ['**/__mocks__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
