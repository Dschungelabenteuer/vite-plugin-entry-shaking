<script setup lang="ts">
import { inject, nextTick, ref, watch } from 'vue';

import MetricsBlock from '@components/MetricsBlock/MetricsBlock.vue';
import Button from '@components/Button/Button.vue';

import { useClassNames } from '@composables/useClassNames';
import type { Panel } from '@views/Panel/Panel.types';
import PanelView from '@views/Panel/Panel.vue';
import Diagnostics from './Diagnostics.vue';
import { useMetricsPanel } from './useMetricsPanel';

const $class = useClassNames('metrics');
const closeBtnRef = ref<InstanceType<typeof Button> | null>(null);
const metricsPanel = inject<Panel>('metricsPanel')!;
const { toggle, openBtnId, isOpen } = metricsPanel;
const {
  timeHeader,
  timeDetails,
  requestsHeader,
  requestsDetails,
  diagnosticsHeader,
  diagnosticsDetails,
  optionsHeader,
  optionsDetails,
} = useMetricsPanel();

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
    <div :class="$class('content')">
      <MetricsBlock
        :header="timeHeader"
        :details="timeDetails"
      />
      <MetricsBlock
        :header="requestsHeader"
        :details="requestsDetails"
      />
      <Diagnostics
        :header="diagnosticsHeader"
        :details="diagnosticsDetails"
      />
      <MetricsBlock
        :header="optionsHeader"
        :details="optionsDetails"
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

<style lang="scss">
#metrics-panel {
  z-index: 1000;
}

.metrics {
  &__content {
    display: flex;
    flex-direction: column;
    max-height: 100%;
    overflow: hidden;
  }
}
</style>
