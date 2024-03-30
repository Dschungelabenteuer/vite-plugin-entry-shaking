import type { MetricProps } from '@components/Metric/Metric.types';

export type MetricsBlockProps = {
  /** Header metric. */
  header: MetricProps;
  /** Content metrics. */
  details: MetricProps[];
};
