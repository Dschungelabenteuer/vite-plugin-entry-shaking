// eslint.config.js
import basePreset from '@yungezeit/eslint-base';

export default [
  ...basePreset,
  {
    ignores: [
      'README.md',
      'RESOURCES.md',
      '_template_',
      'scripts',
      'examples/syntaxes/src/data',
      '.github',
    ],
  },
];
