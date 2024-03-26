import type { Metric } from './MetricsBlock.types';

export const SimpleHeader: Metric = {
  label: 'Number of users',
  icon: 'users',
  value: '444',
  type: 'count',
};

export const SimpleDetails: Metric[] = [
  {
    label: 'Registered users',
    icon: 'user-bolt',
    value: '128',
    type: 'count',
  },
  {
    label: 'Guests',
    icon: 'user-question',
    value: '316',
    type: 'count',
  },
];
