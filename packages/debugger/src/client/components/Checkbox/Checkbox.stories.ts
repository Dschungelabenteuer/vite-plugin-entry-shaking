import type { Meta, StoryObj } from '@storybook/vue3';

import Checkbox from './Checkbox.vue';
import { paddingDecorator } from '$storybook/decorators';
import { getModelRenderFunction } from '$storybook/models';

const meta = {
  component: Checkbox,
  title: 'Components/Checkbox',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
  render: getModelRenderFunction(Checkbox, false),
} satisfies Meta<typeof Checkbox>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    label: 'Is it allowed?',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Is it allowed?',
    disabled: true,
  },
};

export const DisabledAndChecked: Story = {
  render: getModelRenderFunction(Checkbox, true),
  args: {
    label: 'Is it allowed?',
    disabled: true,
  },
};

export default meta;
