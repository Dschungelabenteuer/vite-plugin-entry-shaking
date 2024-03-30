import {
  GuestsUsers,
  RegisteredUsers,
  TotalUsers,
  UsageTime,
} from '@components/Metric/Metric.mocks';
import type { MetricProps } from '@components/Metric/Metric.types';

export const SimpleHeader: MetricProps = TotalUsers;

export const SimpleDetails: MetricProps[] = [RegisteredUsers, GuestsUsers, UsageTime];
