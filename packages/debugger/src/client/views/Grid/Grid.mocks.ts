import type { Column } from './Grid.types';

export const SimpleCols: Record<string, Column> = {
  name: { label: 'Name', width: '2fr' },
  time: { label: 'Time', width: '1fr' },
};

export const SimpleRows = [
  { id: 1, name: 'Item 1', time: 300 },
  { id: 2, name: 'Item 2', time: 100 },
  { id: 3, name: 'Item 3', time: 200 },
];
