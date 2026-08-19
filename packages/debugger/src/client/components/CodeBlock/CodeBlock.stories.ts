import type { Meta, StoryObj } from '@storybook/vue3';

import CodeBlock from './CodeBlock.vue';

import { SimpleSource, SourceDiffFrom, SourceDiffTo } from './CodeBlock.mocks';
import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: CodeBlock,
  title: 'Components/CodeBlock',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof CodeBlock>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = { args: { source: SimpleSource, lang: 'rust' } };

export const WithDiffs: Story = {
  args: { source: SourceDiffFrom, target: SourceDiffTo, lang: 'ts' },
};

export default meta;
