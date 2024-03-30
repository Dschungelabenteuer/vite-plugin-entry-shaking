import type { Meta, StoryObj } from '@storybook/vue3';

import Header from './Header.vue';

import { metricsDecorator, paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Header,
  title: 'Layout/Header',
  tags: ['autodocs'],
  decorators: [metricsDecorator, paddingDecorator],
} satisfies Meta<typeof Header>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {},
};

export default meta;
