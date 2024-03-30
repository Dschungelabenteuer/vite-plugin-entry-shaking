import type { ShortcutGroup } from './Shortcuts.types';

export const SimpleShortcuts: ShortcutGroup[] = [
  {
    // Basic navigation.
    items: [
      { key: 'ArrowUp', label: 'Previous row' },
      { key: 'ArrowDown', label: 'Next row' },
      { key: 'ArrowLeft', label: 'Previous column' },
      { key: 'ArrowRight', label: 'Next column' },
    ],
  },
  {
    // Quick navigation.
    items: [
      { key: 'PageUp', label: 'Previous row' },
      { key: 'PageDown', label: 'Next row' },
      { key: 'Home', label: 'First row', disabled: true },
      { key: 'End', label: 'Last row', disabled: true },
    ],
  },
];
