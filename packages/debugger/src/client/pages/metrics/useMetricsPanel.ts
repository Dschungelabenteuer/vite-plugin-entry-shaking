import { computed } from 'vue';

import { store } from '#store';
import { formatDuration } from '#utils';

import type { Metric } from '@components/MetricsBlock/MetricsBlock.types';

export function useMetricsPanel() {
  const timeHeader = computed<Metric>(() => ({
    label: 'Total process',
    icon: 'clock',
    value: formatDuration(store.metrics?.process ?? 0),
    type: 'duration',
  }));

  const timeDetails = computed<Metric[]>(() => [
    {
      label: 'Entries analysis',
      icon: 'target',
      value: formatDuration(store.metrics?.analysis ?? 0),
      type: 'duration',
    },
    {
      label: 'Transforms',
      icon: 'sparkles',
      value: formatDuration(store.metrics?.transform ?? 0),
      type: 'duration',
    },
  ]);

  const requestsHeader = computed<Metric>(() => ({
    label: 'Total requests',
    icon: 'http-get',
    value: `${(store.metrics?.jsRequests ?? 0) + (store.metrics?.otherRequests ?? 0)}`,
    type: 'count',
  }));

  const requestsDetails = computed<Metric[]>(() => [
    {
      label: 'JS/TS requests',
      icon: 'file-type-js',
      value: `${store.metrics?.jsRequests ?? 0}`,
      type: 'count',
    },
    {
      label: 'Other requests',
      icon: 'file',
      value: `${store.metrics?.otherRequests ?? 0}`,
      type: 'count',
    },
  ]);

  return {
    timeHeader,
    timeDetails,
    requestsHeader,
    requestsDetails,
  };
}
