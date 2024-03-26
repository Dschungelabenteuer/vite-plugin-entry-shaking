export type Metric = {
  /** Metric icon. */
  icon?: string;
  /** Metric label. */
  label: string;
  /** Metric value. */
  value: string;
  /** Metric type. */
  type: 'duration' | 'count';
};

export type MetricsProps = {
  /** Header metric. */
  header: Metric;
  /** Content metrics. */
  details: Metric[];
};
