import { h, reactive } from 'vue';
import type { StoryContext, StoryFn } from '@storybook/vue3';
import ThemeWrapper from './ThemeWrapper.vue';

export type ThemeProps = {
  colorScheme: 'light' | 'dark';
};

const theme = reactive<ThemeProps>({ colorScheme: 'light' });

export const themeDecorator = (storyFn: () => ReturnType<StoryFn>, context: StoryContext) => {
  theme.colorScheme = context.globals.colorScheme || 'light';
  const story = storyFn();

  return () =>
    h(ThemeWrapper, theme, {
      story: () => h(story, { ...context.args }),
    });
};

export const colorScheme = {
  description: 'Global theme for components',
  defaultValue: 'light',
  toolbar: {
    title: 'Color scheme',
    icon: 'circlehollow',
    items: ['light', 'dark'],
    dynamicTitle: true,
  },
};
