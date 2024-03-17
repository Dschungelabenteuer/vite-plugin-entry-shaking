import type { StorybookConfig } from '@storybook/vue3-vite';
import { core } from './core';
import { docs } from './docs';
import { framework } from './framework';

const config: StorybookConfig = {
  core,
  docs,
  framework,
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  previewBody: (body) =>
    `${body} <script>document.querySelector('body').setAttribute('data-color-scheme', 'light');</script>`,
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
};

export default config;
