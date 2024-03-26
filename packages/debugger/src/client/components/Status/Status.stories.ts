import type { Meta, StoryObj } from '@storybook/vue3';

import Status from './Status.vue';

import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Status,
  title: 'Components/Status',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
} satisfies Meta<typeof Status>;

type Story = StoryObj<typeof meta>;

export const Ok: Story = {
  args: { status: 'ok', message: 'All good!' },
};

export const Warning: Story = {
  args: { status: 'warning', message: 'Watch out!' },
};

export const Error: Story = {
  args: { status: 'error', message: 'Something went wrong!' },
};

export const Loading: Story = {
  args: { status: 'loading', message: 'Loading...' },
};

export default meta;
