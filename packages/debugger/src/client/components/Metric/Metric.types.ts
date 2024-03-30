export type MetricProps = {
  /** Metric icon. */
  icon: string;
  /** Metric label. */
  label: string;
  /** Metric value. */
  value: string | number;
  /** Metric type. */
  type: 'duration' | 'count' | 'raw';
  /** Is the metric clickable? */
  clickable?: boolean;
};
