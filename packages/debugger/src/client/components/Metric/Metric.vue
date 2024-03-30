<script setup lang="ts">
import Icon from '@components/Icon/Icon.vue';

import { useClassNames } from '@composables/useClassNames';
import type { MetricProps } from './Metric.types';

const $class = useClassNames('metric');
const props = defineProps<MetricProps>();
</script>

<template>
  <div :class="$class()">
    <Icon :name="icon" />
    <span class="label">{{ label }}</span>
    <span :class="[type, $class('value')]">{{ value }}</span>
  </div>
</template>

<style lang="scss">
.metric {
  --metric-text-color: inherit;

  position: relative;
  display: flex;
  align-items: center;
  padding-block: var(--spacing-md);

  svg {
    margin-inline: var(--spacing-md);
  }

  &__value {
    margin-inline-start: auto;
    color: var(--metric-text-color);
  }

  .duration,
  .count,
  .raw {
    font-family: monospace;
    font-size: var(--font-size-xs);
  }

  &.warn {
    --metric-text-color: var(--status-color-warn);
  }

  &.danger {
    --metric-text-color: var(--status-color-error);
  }
}
</style>
