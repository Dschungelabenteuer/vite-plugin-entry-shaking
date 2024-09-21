import vuePreset from '@yungezeit/eslint-vue';
import globals from 'globals';

export default [
  ...vuePreset,
  {
    ignores: ['dist/**/*', 'README.md'],
  },
  {
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
