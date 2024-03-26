import type { Meta, StoryObj } from '@storybook/vue3';

import Illustration from './Illustration.vue';

import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Illustration,
  title: 'Assets/Illustration',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof Illustration>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {};

export default meta;
