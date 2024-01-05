<script setup lang="ts">
import { inject, nextTick, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';

import type { Panel } from '@composable/usePanel';
import Button from '@component/Button.vue';
import PanelView from '@views/PanelView.vue';

const closeBtnRef = ref<InstanceType<typeof Button> | null>(null);
const metricsPanel = inject<Panel>('metricsPanel')!;
const { toggle, openBtnId, isOpen } = metricsPanel;

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
    <div class="metrics">
      <div class="time">
        <div class="time__total">
          <Icon icon="tabler:clock" />
          <span class="label">Total process</span>
          <span class="duration">310ms</span>
        </div>
        <div class="time__details">
          <div class="entries">
            <Icon icon="tabler:target" />
            <span class="label">Entries analysis</span>
            <span class="duration">310ms</span>
          </div>
          <div class="transforms">
            <Icon icon="tabler:sparkles" />
            <span class="label">Transforms</span>
            <span class="duration">310ms</span>
          </div>
        </div>
      </div>

      <div class="requests">
        <div class="requests__total">
          <Icon icon="tabler:clock" />
          <span class="label">Total requests</span>
          <span class="duration">72</span>
        </div>
        <div class="requests__details">
          <div class="avoidable">
            <Icon icon="tabler:target" />
            <span class="label">Avoidable</span>
            <span class="duration">32</span>
          </div>
          <div class="avoided">
            <Icon icon="tabler:sparkles" />
            <span class="label">Avoided</span>
            <span class="duration">27</span>
          </div>
        </div>
      </div>
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
        label="Export"
        @click="toggle"
      />
    </template>
  </PanelView>
</template>

<style lang="scss">
.metrics {
  .time {
    margin: var(--spacing-lg);

    &__total,
    &__details .entries,
    &__details .transforms {
      display: flex;
      align-items: center;

      .duration {
        margin-inline-start: auto;
        font-family: monospace;
        font-size: var(--font-size-xs);
      }
    }

    svg {
      margin-inline: var(--spacing-md);
    }

    &__total {
      display: flex;
      align-items: center;
      font-size: var(--font-size-sm);
      padding: var(--spacing-md);
      font-size: var(--font-size-md);
      color: var(--text-emphasize-color);
    }

    &__details {
      box-shadow: inset 0 0 0 1px var(--overall-border-color);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      background: var(--background-color-alt-subtle);
      background-size: 100vw 100vh;
      background-attachment: fixed;

      .entries,
      .transforms {
        position: relative;
        display: flex;
        align-items: center;
        padding-block: var(--spacing-md);
      }
    }
  }
}
</style>
