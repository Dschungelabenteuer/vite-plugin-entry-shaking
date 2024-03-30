import type { CheckboxProps } from '@components/Checkbox/Checkbox.types';

export type CheckboxesProps = {
  /** Checkboxes ID. */
  id?: string;
  /** List of checkbox options. */
  options: CheckboxProps[];
  /** Are the checkboxes disabled? */
  disabled?: boolean;
};
