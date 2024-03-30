import type { Meta, StoryObj } from '@storybook/vue3';

import Popover from './Popover.vue';

import { paddingDecorator } from '$storybook/decorators';

/**
 * This component is purely visual.
 *
 * Popover logic is handled by the `usePopover` composable which relies on
 * [floating-ui](https://https://floating-ui.com/) for positioning.
 */

const meta = {
  component: Popover,
  title: 'Components/Popover',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
  args: { isOpen: true },
  render: (args) => ({
    components: { Popover },
    setup() {
      return { args };
    },
    template: `
      <Popover v-bind="args">
        My Popover content
      </Popover>
    `,
  }),
} satisfies Meta<typeof Popover>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {};

export default meta;
