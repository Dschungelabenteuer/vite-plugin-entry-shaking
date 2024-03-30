import type { DropdownMenuItem } from './DropdownMenu.types';

export const SimpleMenuItems: DropdownMenuItem[] = [
  { label: 'Action 1', action: () => console.info(`clicked on Action 1`) },
  { label: 'Action 2', action: () => console.info(`clicked on Action 2`) },
  { label: 'Action 3', action: () => console.info(`clicked on Action 3`) },
];

export const MenuItemsWithIcons: DropdownMenuItem[] = [
  { label: 'Action 1', icon: 'user-plus', action: () => console.info(`clicked on Action 1`) },
  { label: 'Action 2', icon: 'folder-plus', action: () => console.info(`clicked on Action 2`) },
  { label: 'Action 3', icon: 'trash', action: () => console.info(`clicked on Action 3`) },
];
