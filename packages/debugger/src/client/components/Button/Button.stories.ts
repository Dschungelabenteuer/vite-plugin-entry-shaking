import type { Meta, StoryObj } from '@storybook/vue3';

import Button from './Button.vue';
import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Button,
  title: 'Components/Button',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof Button>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    label: 'Prout',
  },
};

export const Icon: Story = {
  args: {
    label: 'Prout',
    icon: 'home',
  },
};

export const IconOnly: Story = {
  args: {
    label: 'Prout',
    icon: 'home',
    iconOnly: true,
  },
};

export default meta;
