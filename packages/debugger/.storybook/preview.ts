import type { Preview } from '@storybook/vue3';
import './style.css';
import '../src/client/styles/common.scss';
import { setup } from '@storybook/vue3';
import { createRouter, createWebHistory } from 'vue-router';
import { themeDecorator, colorScheme } from './theming';

setup((app) => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: () => ({ template: '<div></div>' }) },
      { path: '/logs', component: () => ({ template: '<div></div>' }) },
      { path: '/entries', component: () => ({ template: '<div></div>' }) },
      { path: '/transforms', component: () => ({ template: '<div></div>' }) },
      { path: '/iframe.html', component: () => Promise.resolve({ template: '<div></div>' }) },
    ],
  });

  app.use(router);
});

const preview: Preview = {
  globalTypes: {
    colorScheme,
  },
  decorators: [themeDecorator],
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Assets'],
      },
    },
  },
};

export default preview;
