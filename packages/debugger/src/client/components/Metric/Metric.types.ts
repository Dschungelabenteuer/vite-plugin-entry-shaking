export type MetricProps = {
  /** Metric icon. */
  icon: string;
  /** Metric label. */
  label: string;
  /** Metric value. */
  value: string;
  /** Metric type. */
  type: 'duration' | 'count';
};
