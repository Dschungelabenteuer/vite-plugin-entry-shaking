import type { Meta, StoryObj } from '@storybook/vue3';

import Tooltip from './Tooltip.vue';

import { paddingDecorator } from '$storybook/decorators';

/**
 * This component is purely visual.
 *
 * Tooltip logic is handled by the `useTooltip` composable which relies on
 * [floating-ui](https://https://floating-ui.com/) for positioning.
 */
const meta = {
  component: Tooltip,
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
  args: { isOpen: true },
  render: (args) => ({
    components: { Tooltip },
    setup() {
      return { args };
    },
    template: `
      <Tooltip v-bind="args">
        My Tooltip content
      </Tooltip>
    `,
  }),
} satisfies Meta<typeof Tooltip>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {};

export default meta;
