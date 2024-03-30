import type { Meta, StoryObj } from '@storybook/vue3';

import MetricsBlock from './MetricsBlock.vue';

import { SimpleDetails, SimpleHeader } from './MetricsBlock.mocks';
import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: MetricsBlock,
  title: 'Components/MetricsBlock',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof MetricsBlock>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    header: SimpleHeader,
    details: SimpleDetails,
  },
};

export default meta;
