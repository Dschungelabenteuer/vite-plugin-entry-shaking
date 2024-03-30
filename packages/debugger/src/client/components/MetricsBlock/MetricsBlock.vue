<script setup lang="ts">
import Metric from '@components/Metric/Metric.vue';

import { useClassNames } from '@composables/useClassNames';
import type { MetricsBlockProps } from './MetricsBlock.types';

const $class = useClassNames('metrics');
const props = defineProps<MetricsBlockProps>();
</script>

<template>
  <div :class="$class()">
    <Metric
      :class="$class('header')"
      v-bind="header"
    />
    <div :class="$class('details')">
      <Metric
        v-for="(detail, index) in details"
        :key="`detail-${index}`"
        v-bind="detail"
      />
    </div>
  </div>
</template>

<style lang="scss">
.metrics {
  margin: var(--spacing-lg);

  &__header {
    display: flex;
    align-items: center;
    padding: var(--spacing-md);
    font-size: var(--font-size-md);
    color: var(--text-emphasize-color);
  }

  &__details {
    padding: var(--spacing-md);
    background: var(--background-color-alt-subtle);
    background-attachment: fixed;
    background-size: 100vw 100vh;
    border-radius: var(--radius-md);
    box-shadow: inset 0 0 0 1px var(--overall-border-color);
  }
}
</style>
