import type { Meta, StoryObj } from '@storybook/vue3';

import Panel from './Panel.vue';

const meta = {
  component: Panel,
  title: 'Views/Panel',
  tags: ['autodocs'],
} satisfies Meta<typeof Panel>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    content: 'Textual badge',
  },
};

export default meta;
