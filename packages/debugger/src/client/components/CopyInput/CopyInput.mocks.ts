import type { CopyInputProps } from './CopyInput.types';

export const CopyInputSimple: CopyInputProps = {
  value: './some/item.ts',
  values: [{ value: './some/item.ts', label: 'Copy relative path' }],
};
export const CopyInputMultiple: CopyInputProps = {
  value: './some/item.ts',
  values: [
    { value: './some/item.ts', label: 'Copy relative path' },
    { value: '~/path/to/some/item.ts', label: 'Copy absolute path' },
  ],
};
