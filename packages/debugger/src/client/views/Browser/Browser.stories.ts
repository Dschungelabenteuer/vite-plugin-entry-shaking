import type { Meta, StoryObj } from '@storybook/vue3';

import Browser from './Browser.vue';

const meta = {
  component: Browser,
  title: 'Views/Browser',
  tags: ['autodocs'],
} satisfies Meta<typeof Browser>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    name: 'My browser',
  },
};

export const WithIcon: Story = {
  args: {
    name: 'My browser',
    pageIcon: 'home',
  },
};

export const WithFilters: Story = {
  args: {
    name: 'My browser',
    pageIcon: 'home',
  },
  render: (args) => ({
    components: { Browser },
    setup() {
      return { args };
    },
    template: `
    <Browser v-bind="args">
      <template #filters>
        Filters content
      </template>
    </Browser>
    `,
  }),
};

export const WithAllLoaded: Story = {
  args: {
    total: 444,
    matched: 444,
    name: 'My browser',
  },
};

export const WithSomeLoaded: Story = {
  args: {
    total: 444,
    matched: 128,
    name: 'My browser',
  },
};

export default meta;
