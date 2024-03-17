import type { Meta, StoryObj } from '@storybook/vue3';
import { userEvent, within, expect } from '@storybook/test';

import Browser from './Browser.vue';

const meta = {
  component: Browser,
  title: 'Views/Browser',
  tags: ['autodocs'],
} satisfies Meta<typeof Browser>;

type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    content: 'Textual badge',
  },
};

export const Number: Story = {
  args: {
    content: 14,
  },
};

/** Something */
export const CappedNumber: Story = {
  args: {
    max: 99,
    content: 150,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId('email'), 'email@provider.com');
    await userEvent.type(canvas.getByTestId('password'), 'a-random-password');
    await userEvent.click(canvas.getByRole('button'));
    await expect(
      canvas.getByText(
        'Everything is perfect. Your account is ready and we should probably get you started!',
      ),
    ).toBeInTheDocument();
  },
};

export default meta;
