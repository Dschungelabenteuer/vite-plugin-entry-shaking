import type { Meta, StoryObj } from '@storybook/vue3';

import CopyInput from './CopyInput.vue';
import { CopyInputMultiple, CopyInputSimple } from './CopyInput.mocks';
import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: CopyInput,
  title: 'Components/CopyInput',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof CopyInput>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: CopyInputSimple,
};

export const Multiple: Story = {
  args: CopyInputMultiple,
};

export default meta;
