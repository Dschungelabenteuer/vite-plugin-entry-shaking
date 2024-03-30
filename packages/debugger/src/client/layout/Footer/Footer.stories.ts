import type { Meta, StoryObj } from '@storybook/vue3';

import Footer from './Footer.vue';

import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Footer,
  title: 'Layout/Footer',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof Footer>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: { content: 'Ctrl + K' },
};

export default meta;
