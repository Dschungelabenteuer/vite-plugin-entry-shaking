<script setup lang="ts">
import { computed, inject } from 'vue';

import { formatDuration } from '#utils';
import Metric from '@components/Metric/Metric.vue';
import { useClassNames } from '@composables/useClassNames';
import type { EntryDetailsProps } from '../Entries.types';

const $class = useClassNames('entry-metrics');
const entryDetails = inject<EntryDetailsProps>('entry-details')!;
const totalDuration = computed(() => formatDuration(entryDetails.entry?.time ?? 0));
const selfDuration = computed(() => formatDuration(entryDetails.entry?.self ?? 0));
const importsAnalyzed = computed(() => entryDetails.entry?.importsCount ?? 0);
const hits = computed(() => entryDetails.entry?.hits ?? 0);
</script>

<template>
  <div :class="$class()">
    <Metric
      :icon="'clock'"
      label="Total analysis time"
      :value="totalDuration"
      type="duration"
    />
    <Metric
      :icon="'clock'"
      label="Self analysis time"
      :value="selfDuration"
      type="duration"
    />
    <Metric
      :icon="'file-import'"
      label="Imports analyzed"
      :value="importsAnalyzed"
      type="count"
    />
    <Metric
      :icon="'trending-up'"
      label="Hits"
      :value="hits"
      type="count"
    />
  </div>
</template>

<style lang="scss">
.entry-metrics {
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
