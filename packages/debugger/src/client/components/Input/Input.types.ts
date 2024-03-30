export type InputProps = {
  /** Input ID. */
  id?: string;
  /** Input placeholder. */
  placeholder?: string;
  /** Is the input disabled? */
  disabled?: boolean;
  /** Is the input readonly? */
  readonly?: boolean;
  /** Input icon. */
  icon?: string;
  /** If specified, adds a shortcut hint to button action. */
  shortcut?: string;
};

export type InputSlots = {
  /** Rendered before input (but after label). */
  before?: () => any;
  /** Rendered after input. */
  after?: () => any;
};
