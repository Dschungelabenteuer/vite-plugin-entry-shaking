<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue';

import { store } from '#store';
import { formatDuration } from '#utils';
import type { Metric } from '@component/Metrics.vue';
import Metrics from '@component/Metrics.vue';
import Button from '@component/Button/Button.vue';

import type { Panel } from '@composable/usePanel';
import PanelView from '@views/PanelView.vue';

const closeBtnRef = ref<InstanceType<typeof Button> | null>(null);
const metricsPanel = inject<Panel>('metricsPanel')!;
const { toggle, openBtnId, isOpen } = metricsPanel;

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

watch(isOpen, (open) => {
  nextTick(() => {
    const el = open ? closeBtnRef.value?.reference : document.getElementById(openBtnId);
    if (el) (el as HTMLElement).focus();
  });
});
</script>

<template>
  <PanelView
    panel-id="metrics-panel"
    title="Metrics"
    close-panel-label="Close metrics panel"
  >
    <div>
      <Metrics
        :header="timeHeader"
        :details="timeDetails"
      />
      <Metrics
        :header="requestsHeader"
        :details="requestsDetails"
      />
    </div>
    <template #footer>
      <Button
        class="bordered"
        icon="upload"
        disabled="Imports are only possible when running a detached instance."
        label="Import"
        @click="toggle"
      />
      <Button
        class="bordered"
        icon="download"
        disabled="Coming soon (or later)"
        label="Export"
        @click="toggle"
      />
    </template>
  </PanelView>
</template>
