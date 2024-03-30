export type DialogProps = {
  /** Dialog id. */
  id?: string;
  /** Dialog title. */
  title?: string;
  /** Dialog width. */
  width?: string;
  /** Dialog height. */
  height?: string;
  /** Should dialog content be removed its default padding? */
  unpad?: boolean;
};

export type DialogEvents = {
  /** Emitted when the dialog is closed. */
  close: [];
};

export type DialogSlots = {
  /** Dialog content. */
  default(): any;
  /** Dialog footer. */
  footer(): any;
};
