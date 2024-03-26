import type { Meta, StoryObj } from '@storybook/vue3';

import Base from './Base.vue';

const meta = {
  component: Base,
  title: 'Layout/Base',
  tags: ['autodocs'],
  decorators: [],
} satisfies Meta<typeof Base>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {},
};

export default meta;
