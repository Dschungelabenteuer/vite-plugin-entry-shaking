import type { MetricProps } from '@components/Metric/Metric.types';

export type MetricsProps = {
  /** Header metric. */
  header: MetricProps;
  /** Content metrics. */
  details: MetricProps[];
};
