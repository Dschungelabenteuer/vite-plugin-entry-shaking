import type { Meta, StoryObj } from '@storybook/vue3';

import Checkboxes from './Checkboxes.vue';
import { Options, OptionsWithDisabled } from './Checkboxes.mocks';
import { paddingDecorator } from '$storybook/decorators';
import { getModelRenderFunction } from '$storybook/models';

const meta = {
  component: Checkboxes,
  title: 'Components/Checkboxes',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
  render: getModelRenderFunction(Checkboxes, []),
} satisfies Meta<typeof Checkboxes>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    options: Options,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    options: Options,
  },
};

export const DisabledOptions: Story = {
  render: getModelRenderFunction(Checkboxes, [
    OptionsWithDisabled[0].value,
    OptionsWithDisabled[3].value,
  ]),
  args: {
    options: OptionsWithDisabled,
  },
};

export default meta;
