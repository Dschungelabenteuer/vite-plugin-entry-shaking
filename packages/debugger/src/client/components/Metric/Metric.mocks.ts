import type { MetricProps } from './Metric.types';

export const TotalUsers: MetricProps = {
  label: 'Number of users',
  icon: 'users',
  value: '444',
  type: 'count',
};

export const RegisteredUsers: MetricProps = {
  label: 'Registered users',
  icon: 'user-bolt',
  value: '128',
  type: 'count',
};

export const GuestsUsers: MetricProps = {
  label: 'Guests',
  icon: 'user-question',
  value: '316',
  type: 'count',
};

export const UsageTime: MetricProps = {
  label: 'Usage time',
  icon: 'clock',
  value: '1.5s',
  type: 'duration',
};
