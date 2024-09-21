import { computed } from 'vue';

import { store } from '#store';
import { formatDuration } from '#utils';
import type { MetricProps } from '@components/Metric/Metric.types';

export function useMetricsPanel() {
  const timeHeader = computed<MetricProps>(() => ({
    label: 'Total process',
    icon: 'clock',
    value: formatDuration(store.metrics.process),
    type: 'duration',
  }));

  const timeDetails = computed<MetricProps[]>(() => [
    {
      label: 'Entries analysis',
      icon: 'target',
      value: formatDuration(store.metrics.analysis),
      type: 'duration',
    },
    {
      label: 'Transforms',
      icon: 'sparkles',
      value: formatDuration(store.metrics.transform),
      type: 'duration',
    },
  ]);

  const requestsHeader = computed<MetricProps>(() => ({
    label: 'Total requests',
    icon: 'http-get',
    value: `${store.metrics.jsRequests + store.metrics.otherRequests}`,
    type: 'count',
  }));

  const requestsDetails = computed<MetricProps[]>(() => [
    {
      label: 'JS/TS requests',
      icon: 'file-type-js',
      value: `${store.metrics.jsRequests}`,
      type: 'count',
    },
    {
      label: 'Other requests',
      icon: 'file',
      value: `${store.metrics.otherRequests}`,
      type: 'count',
    },
  ]);

  const diagnosticsHeader = computed<MetricProps>(() => ({
    label: 'Diagnostics',
    icon: 'alert-triangle',
    value: store.diagnostics.list.length,
    type: 'count',
  }));

  const diagnosticsDetails = computed<MetricProps[]>(() => [
    {
      label: 'definedWithinEntry',
      icon: 'settings',
      value: String(store.options.diagnostics?.definedWithinEntry ?? false),
      type: 'raw',
    },
    {
      label: 'maxDepthReached',
      icon: 'settings',
      value: String(store.options.diagnostics?.maxDepthReached ?? false),
      type: 'raw',
    },
  ]);

  const optionsHeader = computed<MetricProps>(() => ({
    label: 'Options',
    icon: 'settings',
    value: '',
    type: 'raw',
  }));

  const optionsDetails = computed<MetricProps[]>(() => [
    {
      label: 'maxWildcardDepth',
      icon: 'code-asterisk',
      value: store.options.maxWildcardDepth ?? '0',
      type: 'raw',
    },
    {
      label: 'debug',
      icon: 'bug',
      value: String(store.options.debug ?? false),
      type: 'raw',
    },
  ]);

  return {
    timeHeader,
    timeDetails,
    requestsHeader,
    requestsDetails,
    diagnosticsHeader,
    diagnosticsDetails,
    optionsHeader,
    optionsDetails,
  };
}
