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
    label: 'My button',
  },
};

export const Icon: Story = {
  args: {
    label: 'My button',
    icon: 'home',
  },
};

export const IconOnly: Story = {
  args: {
    label: 'My button',
    icon: 'home',
    iconOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'My button',
    disabled: true,
  },
};

export const WithShortcut: Story = {
  args: {
    label: 'My button',
    shortcut: 'Cmd+C',
  },
};

export const WithBadge: Story = {
  args: {
    label: 'My button',
    badge: 'new',
  },
};

export default meta;
