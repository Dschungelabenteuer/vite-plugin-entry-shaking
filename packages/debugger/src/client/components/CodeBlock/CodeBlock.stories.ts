import type { Meta, StoryObj } from '@storybook/vue3';

import CodeBlock from './CodeBlock.vue';

import { SimpleSource } from './CodeBlock.mocks';
import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: CodeBlock,
  title: 'Components/CodeBlock',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof CodeBlock>;

type Story = StoryObj<typeof meta>;

export const Rust: Story = { args: { content: SimpleSource, language: 'rust', lineWrap: false } };
export const Typescript: Story = {
  args: { content: SimpleSource, language: 'javascript', lineWrap: true },
};

export default meta;
