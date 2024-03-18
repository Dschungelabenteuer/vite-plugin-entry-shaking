import type { Meta, StoryObj } from '@storybook/vue3';

import Checkbox from './Checkbox.vue';
import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Checkbox,
  title: 'Components/Checkbox',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof Checkbox>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    label: 'Is it allowed?',
    value: true,
  },
};

export default meta;
