import type { ChannelStore } from '#types';
import type { MetricsBlockProps } from '@components/MetricsBlock/MetricsBlock.types';

export type DiagnosticsProps = MetricsBlockProps;

export type DiagnosticsOverviewProps = {
  /** Diagnostics. */
  diagnostics: ChannelStore['diagnostics'];
};

export type DiagnosticsOverviewEvents = {
  /** Redirects to file's diagnostics. */
  view: [path: string];
};
