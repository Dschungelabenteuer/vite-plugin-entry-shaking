import type { CheckboxProps } from '@components/Checkbox/Checkbox.types';

export const Options: CheckboxProps[] = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
  { label: 'Option 4', value: '4' },
];

export const OptionsWithDisabled: CheckboxProps[] = [
  ...Options.slice(0, 2),
  { ...Options[2], disabled: true },
  { ...Options[3], disabled: true },
];
