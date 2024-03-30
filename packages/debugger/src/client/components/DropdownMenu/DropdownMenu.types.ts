export type DropdownMenuProps = {
  /** Menu items. */
  items: DropdownMenuItem[];
  /** Is the dropdown menu open? */
  isOpen?: boolean;
  /** Is the dropdown menu transitioning? */
  isTransitioning?: boolean;
};

export type DropdownMenuItem = {
  /** Label of menu item. */
  label: string;
  /** Icon of menu item. */
  icon?: string;
  /** Subitems */
  children?: DropdownMenuItem[];
  /** Action triggered when clicking the menu item. */
  action?: (...args: any[]) => any;
};

export type DropdownMenuEvents = {
  /** Emitted when the dropdown is closed. */
  close: [];
};
