<script setup lang="ts">
import { inject, nextTick, ref, watch } from 'vue';
import IconButton from './IconButton.vue';
import type { MetricsPanel } from '../composables/useMetricsPanel';

const closeBtnRef = ref<InstanceType<typeof IconButton> | null>(null);
const metricsPanel = inject<MetricsPanel>('metricsPanel')!;
const { toggle, openBtnId, isOpen } = metricsPanel;

watch(isOpen, (open) => {
  nextTick(() => {
    const el = open ? closeBtnRef.value?.reference : document.getElementById(openBtnId);
    if (el) (el as HTMLElement).focus();
  });
});
</script>

<template>
  <div
    id="metrics-panel"
    role="region"
    class="metrics"
  >
    <div class="metrics__content">
      <header class="metrics__header">
        <IconButton
          ref="closeBtnRef"
          size="large"
          aria-controls="metrics-panel"
          :aria-expanded="true"
          icon="tabler:arrow-bar-right"
          label="Close metrics panel"
          @click="toggle"
        />
        <h2>Metrics</h2>
      </header>
    </div>
    <div
      class="metrics__backdrop"
      @click="toggle"
    />
  </div>
</template>

<style lang="scss">
@import '../styles/mixins';
@import '../styles/variables';

.metrics {
  @include contained;
  max-width: 300px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: var(--size-header) 1fr var(--size-footer);

  &__backdrop {
    z-index: 10;
    background: rgba(0, 0, 0, 0.3);
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    backdrop-filter: blur(6px);
    opacity: 0;
    transition: all ease var(--transition-duration-short);
  }

  &__content {
    z-index: 20;
    background: var(--overall-background-color);
    border-inline-start: 1px solid var(--overall-border-color);
    color: var(--text-color);
    height: 100vh;
    backdrop-filter: blur(12px);
  }

  &__header {
    box-shadow: 0 0 0 1px var(--overall-border-color);
    display: flex;
    padding-block: 1.5px;
    align-items: center;

    > .icon-button {
      height: 100%;
    }

    h2 {
      font-size: 1.14rem;
      width: 100%;
      padding-inline-start: var(--spacing-md);
    }
  }

  @media (max-width: $breakpoint-md) {
    position: absolute;
    inset-inline-end: 0;

    &__backdrop {
      pointer-events: all;
      opacity: 1;
    }
  }
}
</style>
