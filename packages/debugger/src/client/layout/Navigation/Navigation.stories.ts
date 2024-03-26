import type { Meta, StoryObj } from '@storybook/vue3';

import Navigation from './Navigation.vue';

import { metricsDecorator, paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Navigation,
  title: 'Layout/Navigation',
  tags: ['autodocs'],
  decorators: [metricsDecorator, paddingDecorator],
} satisfies Meta<typeof Navigation>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {},
};

export default meta;
