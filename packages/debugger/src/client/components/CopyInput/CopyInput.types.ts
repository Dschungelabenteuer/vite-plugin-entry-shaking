export type CopyInputProps = {
  /** Displayed input value. */
  value: string;
  /** Input icon. */
  icon?: string;
  /** Copy button label. */
  copyLabel?: string;
  /** Copyable value(s). */
  values: CopyInputItem[];
};

export type CopyInputItem = {
  /** Label of copy input item. */
  label: string;
  /** Icon of copy input item. */
  icon?: string;
  /** Value */
  value: string;
};
