import type { Meta, StoryObj } from '@storybook/vue3';

import VerticalTabs from './VerticalTabs.vue';

const meta = {
  component: VerticalTabs,
  title: 'Views/VerticalTabs',
  tags: ['autodocs'],
} satisfies Meta<typeof VerticalTabs>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {},
};

export default meta;
