import type { StorybookConfig } from '@storybook/vue3-vite';

export const core: StorybookConfig['core'] = {
  builder: {
    name: '@storybook/builder-vite',
    options: {
      viteConfigPath: './src/client/vite.config.ts',
    },
  },
};
