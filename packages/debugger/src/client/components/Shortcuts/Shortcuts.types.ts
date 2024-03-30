export type ShortcutData = {
  /** Shortcut's action label. */
  label: string;
  /** Shortcut's key(s) (array for key combinations) */
  key: string | string[];
  /** Is the shortcut disabled? */
  disabled?: boolean;
};

export type ShortcutGroup = {
  /** Group label. */
  label?: string;
  /** Group shortcuts. */
  items: ShortcutData[];
  /** Is the group disabled? */
  disabled?: boolean;
};

export type ShortcutsProps = ShortcutsHintProps & ShortcutsListProps & { id?: string };

export type ShortcutsEvents = {
  /** Emitted when closing the shortcut list. */
  'close-list': [];
};

export type ShortcutsHintProps = {
  /** Unique identifier for the helper. */
  id: string;
  /** Tooltip message (controls hidden). */
  message: string;
  /** Should the tooltip be shown? */
  showTooltip?: boolean;
};

export type ShortcutsListProps = {
  /** Unique identifier for the helper. */
  id: string;
  /** Shortcuts (groupped) */
  shortcuts: ShortcutGroup[];
  /** Should the shortcut list be shown? */
  showList?: boolean;
};
