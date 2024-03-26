<script setup lang="ts">
import { inject, nextTick, ref, watch } from 'vue';

import MetricsBlock from '@components/MetricsBlock/MetricsBlock.vue';
import Button from '@components/Button/Button.vue';

import type { Panel } from '@views/Panel/Panel.types';
import PanelView from '@views/Panel/Panel.vue';
import { useMetricsPanel } from './useMetricsPanel';

const closeBtnRef = ref<InstanceType<typeof Button> | null>(null);
const metricsPanel = inject<Panel>('metricsPanel')!;
const { toggle, openBtnId, isOpen } = metricsPanel;
const { timeHeader, timeDetails, requestsHeader, requestsDetails } = useMetricsPanel();

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
      <MetricsBlock
        :header="timeHeader"
        :details="timeDetails"
      />
      <MetricsBlock
        :header="requestsHeader"
        :details="requestsDetails"
      />
    </div>
    <template #footer>
      <Button
        :bordered="true"
        icon="upload"
        disabled="Imports are only possible when running a detached instance."
        label="Import"
        @click="toggle"
      />
      <Button
        :bordered="true"
        icon="download"
        disabled="Coming soon (or later)"
        label="Export"
        @click="toggle"
      />
    </template>
  </PanelView>
</template>
