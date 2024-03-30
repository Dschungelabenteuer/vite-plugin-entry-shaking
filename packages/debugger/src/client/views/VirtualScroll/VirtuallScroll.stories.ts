import type { Meta, StoryObj } from '@storybook/vue3';

import VirtualScroll from './VirtualScroll.vue';

const meta = {
  component: VirtualScroll,
  title: 'Views/VirtualScroll',
  tags: ['autodocs'],
} satisfies Meta<typeof VirtualScroll>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {},
};

export default meta;
