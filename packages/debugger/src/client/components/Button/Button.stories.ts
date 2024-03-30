import type { Meta, StoryObj } from '@storybook/vue3';

import Icon from '@components/Icon/Icon.vue';
import Kbd from '@components/Kbd/Kbd.vue';
import Badge from '@components/Badge/Badge.vue';
import Button from './Button.vue';
import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Button,
  title: 'Components/Button',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof Button>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    class: 'bordered',
    label: 'My button',
  },
};

export const WithIcon: Story = {
  args: {
    class: 'bordered',
    label: 'My button',
    icon: 'home',
  },
};

export const WithIconOnly: Story = {
  args: {
    class: 'bordered',
    label: 'My button',
    icon: 'home',
    iconOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    class: 'bordered',
    label: 'My button',
    disabled: true,
  },
};

export const DisabledWithReason: Story = {
  args: {
    class: 'bordered',
    label: 'My button',
    disabled: 'You have no right!',
  },
};

export const WithPopover: Story = {
  args: {
    class: 'bordered',
    label: 'My button',
  },
  render: () => ({
    components: { Button },
    template: `
    <Button label="My button" class="bordered">
      <template #popover>
        Popover content!
      </template>
    </Button>
    `,
  }),
};

/** You may add trailing content to the button by using the `after` slot. */
export const WithTrailingContent: Story = {
  args: {
    class: 'bordered',
    label: 'My button',
  },
  render: () => ({
    components: { Button, Icon, Kbd, Badge },
    template: `
    <Button label="My button" class="bordered">
      <template #after>
        <Icon name="arrow-right" />
      </template>
    </Button>
    <Button label="My button" class="bordered">
      <template #after>
        <Badge content="new" />
      </template>
    </Button>
    <Button label="My button" class="bordered">
      <template #after>
        <Kbd content="Cmd+K" />
      </template>
    </Button>
    `,
  }),
};

export default meta;
