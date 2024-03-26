import type { Meta, StoryObj } from '@storybook/vue3';

import Kbd from './Kbd.vue';

import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Kbd,
  title: 'Components/Kbd',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof Kbd>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: { content: 'Ctrl+K' },
};

export default meta;
