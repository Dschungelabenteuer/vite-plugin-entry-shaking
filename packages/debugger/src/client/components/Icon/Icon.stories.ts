import type { Meta, StoryObj } from '@storybook/vue3';

import Icon from './Icon.vue';

import { paddingDecorator } from '$storybook/decorators';

/**
 * Icon system is powered by [iconify](https://iconify.design/)
 * and icons are provided by [tabler icons](https://tabler.io/icons).
 */

const meta = {
  component: Icon,
  title: 'Components/Icon',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof Icon>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: { name: 'home' },
};

export const WithTooltip: Story = {
  args: { name: 'home', tooltip: 'Some tooltip' },
};

export default meta;
