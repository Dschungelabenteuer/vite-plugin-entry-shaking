import type { Meta, StoryObj } from '@storybook/vue3';

import Metric from './Metric.vue';

import { TotalUsers, UsageTime } from './Metric.mocks';
import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Metric,
  title: 'Components/Metric',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof Metric>;

type Story = StoryObj<typeof meta>;

export const Count: Story = {
  args: TotalUsers,
};

export const Duration: Story = {
  args: UsageTime,
};

export default meta;
