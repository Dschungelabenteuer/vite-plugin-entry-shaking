import type { Meta, StoryObj } from '@storybook/vue3';

import Grid from './Grid.vue';
import { SimpleCols, SimpleRows } from './Grid.mocks';
import { containedDecorator, paddingDecorator } from '$storybook/decorators';

const meta = {
  /** @ts-expect-error Investigate SB support of generic components. */
  component: Grid,
  title: 'Views/Grid',
  tags: ['autodocs'],
  decorators: [containedDecorator('500px'), paddingDecorator],
} satisfies Meta<typeof Grid>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    id: 'grid',
    title: 'Grid',
    items: SimpleRows,
    columns: SimpleCols,
    minItemSize: 40,
    sort: {},
  },
  /** @ts-expect-error Investigate SB support of generic components. */
  render: (args) => ({
    components: { Grid },
    setup() {
      return { args };
    },
    template: `
    <Grid v-bind="args">
      <template #row="{ item }">
        <div>{{ item.name }}</div>
        <div>{{ item.time }}</div>
      </template>
    </Grid>
    `,
  }),
};

export default meta;
