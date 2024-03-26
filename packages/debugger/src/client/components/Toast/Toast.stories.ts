import type { Meta, StoryObj } from '@storybook/vue3';

import Toast from './Toast.vue';

import { paddingDecorator } from '$storybook/decorators';

/**
 * This component is purely visual.
 *
 * Toast logic is handled by the `useToast` composable which relies on
 * [floating-ui](https://https://floating-ui.com/) for positioning.
 */
const meta = {
  component: Toast,
  title: 'Components/Toast',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
  args: {},
  render: (args) => ({
    components: { Toast },
    setup() {
      return { args };
    },
    template: `
      <Toast v-bind="args">
        This is the content of the toast!
      </Toast>
    `,
  }),
} satisfies Meta<typeof Toast>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {},
};

export const Info: Story = {
  args: {
    type: 'info',
  },
};

export const Success: Story = {
  args: {
    type: 'success',
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
  },
};

export const Error: Story = {
  args: {
    type: 'error',
  },
};

export const Loading: Story = {
  args: {
    type: 'loading',
  },
};

export default meta;
