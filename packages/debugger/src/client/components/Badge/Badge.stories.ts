import type { Meta, StoryObj } from '@storybook/vue3';

import Badge from './Badge.vue';

import { Number_content, Text_content } from './Badge.mocks';
import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Badge,
  title: 'Components/Badge',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof Badge>;

type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { content: Text_content },
};

export const Number: Story = {
  args: { content: Number_content },
};

/** In this example, `max` is set to `5`. */
export const MaxLengthText: Story = {
  args: {
    max: 5,
    content: Text_content,
  },
};

/** The actual content is 150, but `max` is set to `99`. */
export const CappedNumber: Story = {
  args: {
    max: 99,
    content: Number_content,
  },
};

export default meta;
