import type { StorybookConfig } from '@storybook/vue3-vite';

const stories: StorybookConfig['stories'] = [
  '../src/**/*.mdx',
  '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
];

const addons: StorybookConfig['addons'] = [
  '@storybook/addon-links',
  '@storybook/addon-essentials',
  '@chromatic-com/storybook',
  '@storybook/addon-interactions',
];

const docs: StorybookConfig['docs'] = {
  autodocs: 'tag',
};

const core: StorybookConfig['core'] = {
  builder: {
    name: '@storybook/builder-vite',
    options: {
      viteConfigPath: './src/client/vite.config.ts',
    },
  },
};

const framework: StorybookConfig['framework'] = {
  name: '@storybook/vue3-vite',
  options: {},
};

const config: StorybookConfig = {
  core,
  docs,
  addons,
  framework,
  stories,
  previewBody: (body) =>
    `${body} <script>document.querySelector('body').setAttribute('data-color-scheme', 'light');</script>`,
};

export default config;
