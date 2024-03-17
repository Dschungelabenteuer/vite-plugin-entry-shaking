import type { Preview } from '@storybook/vue3';
import './style.css';
import '../src/client/styles/common.scss';
import { themeDecorator, colorScheme } from './theming';

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
  },
};

export default preview;
