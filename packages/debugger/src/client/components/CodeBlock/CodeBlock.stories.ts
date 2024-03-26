import type { Meta, StoryObj } from '@storybook/vue3';

import CodeBlock from './CodeBlock.vue';

import { SimpleSource, SourceDiffFrom, SourceDiffTo, TsSource } from './CodeBlock.mocks';
import { paddingDecorator } from '$storybook/decorators';

/**
 * CodeBlocks are powered by [Shiki](https://shiki.style/).
 */
const meta = {
  component: CodeBlock,
  title: 'Components/CodeBlock',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof CodeBlock>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    source: SimpleSource,
    lang: 'rust',
  },
};

/**
 * When using TypeScript source code, the [`@shikijs/twoslash`](https://shiki.style/packages/twoslash) transformer is used
 * by default to integrate [twoslash](https://github.com/twoslashes/twoslash) and benefit from type hints.
 */
export const WithTwoSlash: Story = {
  args: {
    source: TsSource,
    lang: 'typescript',
  },
};

export const WithDiffs: Story = {
  args: {
    source: SourceDiffFrom,
    target: SourceDiffTo,
    lang: 'ts',
  },
};

export default meta;
