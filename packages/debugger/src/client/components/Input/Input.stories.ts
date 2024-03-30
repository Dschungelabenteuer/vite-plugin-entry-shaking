import type { Meta, StoryObj } from '@storybook/vue3';

import Button from '@components/Button/Button.vue';
import Input from './Input.vue';
import { paddingDecorator } from '$storybook/decorators';
import { getModelRenderFunction } from '$storybook/models';

const meta = {
  component: Input,
  title: 'Components/Input',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
  render: getModelRenderFunction(Input, undefined),
} satisfies Meta<typeof Input>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {},
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Readonly: Story = {
  args: {
    readonly: true,
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'My placeholder…',
  },
};

export const WithIcon: Story = {
  args: {
    icon: 'search',
  },
};

/** The shorcut prop is purely visual, implementation is up to you. */
export const WithShortcut: Story = {
  args: {
    shortcut: 'Cmd+K',
  },
};

export const WithValue: Story = {
  render: getModelRenderFunction(Input, 'some value'),
  args: {},
};

export const WithLeadingContent: Story = {
  args: {},
  render: (args) => ({
    components: { Input },
    setup() {
      return { args };
    },
    template: `
      <Input v-bind="args">
        <template #before>
         <span style="font-size: var(--font-size-xs); margin-inline: var(--spacing-md)">Before!</span>
        </template>
      </Input>
    `,
  }),
};

export const WithTrailingContent: Story = {
  args: {},
  render: (args) => ({
    components: { Input, Button },
    setup() {
      return { args };
    },
    template: `
      <Input v-bind="args">
        <template #after>
        <Button label="Send message" icon="send" :icon-only="true" />
        </template>
      </Input>
    `,
  }),
};

export const WithLabel: Story = {
  args: {},
  render: (args) => ({
    components: { Input },
    setup() {
      const id = 'input-with-aria-label-iddd';
      return { args, id };
    },
    template: `
      <label :for="id">My input</label>
      <Input v-bind="args" :id="id" />
    `,
  }),
};

export const WithAriaLabel: Story = {
  args: {},
  render: (args) => ({
    components: { Input },
    setup() {
      return { args };
    },
    template: `<Input v-bind="args" aria-label="My input label supplied by aria-label" />`,
  }),
};

export default meta;
