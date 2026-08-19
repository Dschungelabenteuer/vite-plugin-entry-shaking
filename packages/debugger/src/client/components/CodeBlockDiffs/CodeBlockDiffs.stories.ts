import type { Meta, StoryObj } from '@storybook/vue3';

import CodeBlockDiffs from './CodeBlockDiffs.vue';

import { SourceDiffFrom, SourceDiffTo } from './CodeBlockDiffs.mocks';
import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: CodeBlockDiffs,
  title: 'Components/CodeBlockDiffs',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof CodeBlockDiffs>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: { from: SourceDiffFrom, to: SourceDiffTo, mode: 'simple', lineWrap: true },
};

export default meta;
