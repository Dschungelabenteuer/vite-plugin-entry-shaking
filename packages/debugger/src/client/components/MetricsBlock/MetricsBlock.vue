<script setup lang="ts">
import Icon from '@components/Icon/Icon.vue';

import { useClassNames } from '@composables/useClassNames';
import type { MetricsProps } from './MetricsBlock.types';

const $class = useClassNames('metrics');
const props = defineProps<MetricsProps>();
const valueClass = 'metric__value';
</script>

<template>
  <div :class="$class()">
    <div :class="$class('header')">
      <Icon :name="header.icon!" />
      <span class="label">{{ header.label }}</span>
      <span :class="[header.type, valueClass]">{{ header.value }}</span>
    </div>
    <div :class="$class('details')">
      <div
        v-for="(detail, index) in details"
        :key="`detail-${index}`"
      >
        <Icon :name="detail.icon!" />
        <span class="label">{{ detail.label }}</span>
        <span :class="[detail.type, valueClass]">{{ detail.value }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.metrics {
  margin: var(--spacing-lg);

  svg {
    margin-inline: var(--spacing-md);
  }

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

    > div {
      position: relative;
      display: flex;
      align-items: center;
      padding-block: var(--spacing-md);
    }
  }

  .metric {
    &__value {
      margin-inline-start: auto;
    }
  }

  .duration,
  .count {
    font-family: monospace;
    font-size: var(--font-size-xs);
  }
}
</style>
