import type { Meta, StoryObj } from '@storybook/vue3';

import Button from '@components/Button/Button.vue';
import Icon from '@components/Icon/Icon.vue';
import DropdownMenu from './DropdownMenu.vue';
import { SimpleMenuItems, MenuItemsWithIcons } from './DropdownMenu.mocks';

import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: DropdownMenu,
  title: 'Components/DropdownMenu',
  tags: ['autodocs'],
  decorators: [
    () => ({ template: '<div style="min-height: 8em;"><story/></div>' }),
    paddingDecorator,
  ],
  render: (args) => ({
    components: { DropdownMenu, Button },
    setup() {
      return { args };
    },
    template: `
    <Button label="Dropdown" class="bordered">
      <template #popover="{ isOpen, isTransitioning }">
        <DropdownMenu v-bind="args" :is-open :is-transitioning />
      </template>
    </Button>
    `,
  }),
} satisfies Meta<typeof DropdownMenu>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    items: SimpleMenuItems,
  },
};

export const WithIcons: Story = {
  args: {
    items: MenuItemsWithIcons,
  },
  render: (args) => ({
    components: { DropdownMenu, Button, Icon },
    setup() {
      return { args };
    },
    template: `
    <Button label="Dropdown" class="bordered">
      <template #popover="{ isOpen, isTransitioning }">
        <DropdownMenu v-bind="args" :is-open :is-transitioning />
      </template>
      <template #after>
        <Icon name="chevron-down" />
      </template>
    </Button>
    `,
  }),
};

export default meta;
