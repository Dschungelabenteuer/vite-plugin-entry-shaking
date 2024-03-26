import type { Meta, StoryObj } from '@storybook/vue3';

import Shortcuts from './Shortcuts.vue';

import ShortcutsHint from './ShortcutsHint.vue';
import ShortcutsList from './ShortcutsList.vue';
import { SimpleShortcuts } from './Shortcuts.mocks';
import { paddingDecorator } from '$storybook/decorators';

/**
 * The shortcut helper component is an helper to display keyboard shortcuts.
 * It consists in two main elements:
 * 1. A popover that lets the user know about the shortcut herlper and how to display it.
 * 2. A floating element that lists all available shortcuts.
 */

const meta = {
  component: Shortcuts,
  title: 'Components/Shortcuts',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
  subcomponents: { ShortcutsHint, ShortcutsList },
  args: {
    message: 'Use keys to navigate',
    shortcuts: SimpleShortcuts,
  },
} satisfies Meta<typeof Shortcuts>;

type Story = StoryObj<typeof meta>;

export const ShortcutHint: Story = {
  decorators: [() => ({ template: `<div style="height: 12px"><story /></div>` })],
  args: {
    showTooltip: true,
  },
};

export const ShortcutList: Story = {
  decorators: [() => ({ template: `<div style="height: 154px"><story /></div>` })],
  args: {
    showList: true,
  },
};

export default meta;
