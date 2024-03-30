<script setup lang="ts">
import { computed, inject } from 'vue';
import { formatDuration } from '#utils';
import Metric from '@components/Metric/Metric.vue';
import { useClassNames } from '@composables/useClassNames';
import type { TransformDetailsProps } from '../Transform.types';

const $class = useClassNames('transform-metrics');
const transformDetails = inject<TransformDetailsProps>('transform-details')!;
const transformDuration = computed(() => formatDuration(transformDetails.transform?.time ?? 0));
const entriesImported = computed(() => transformDetails.transform?.entriesMatched ?? 0);
</script>

<template>
  <div :class="$class()">
    <Metric
      :icon="'clock'"
      label="Total analysis time"
      :value="transformDuration"
      type="duration"
    />
    <Metric
      :icon="'target'"
      label="Entries imported"
      :value="entriesImported"
      type="count"
    />
  </div>
</template>

<style lang="scss">
.transform-metrics {
  .metric {
    padding: var(--spacing-lg);
    margin: var(--spacing-xl) var(--spacing-lg);
    font-size: var(--font-size-md);
    border-radius: var(--radius-md);
    box-shadow:
      0 0 0 1px var(--popover-border-color),
      0.4px 0.7px 0.9px hsl(var(--shadow-color) / 22%),
      1.1px 2px 2.6px -0.8px hsl(var(--shadow-color) / 22%),
      2.7px 4.8px 6.2px -1.7px hsl(var(--shadow-color) / 22%);

    svg {
      margin-inline-end: var(--spacing-lg);
    }

    &__value {
      font-size: var(--font-size-xl);
    }
  }
}
</style>
