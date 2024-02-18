<script setup lang="ts">
import Icon from '@component/Icon.vue';

export type Metric = {
  /** Metric icon. */
  icon?: string;
  /** Metric label. */
  label: string;
  /** Metric value. */
  value: string;
  /** Metric type. */
  type: 'duration' | 'count';
}

export type MetricsProps = {
  header: Metric;
  details: Metric[];
};

const props = defineProps<MetricsProps>();
const valueClass = 'metric__value';
</script>

<template>
  <div class="metrics">
    <div class="metrics__header">
      <Icon :name="header.icon!" />
      <span class="label">{{ header.label }}</span>
      <span :class="[header.type, valueClass]">{{ header.value }}</span>
    </div>
    <div class="metrics__details">
      <div v-for="( detail, index ) in  details " :key="`detail-${index}`">
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

    >div {
      position: relative;
      display: flex;
      align-items: center;
      padding-block: var(--spacing-md);
    }
  }

  .metric__value {
    margin-inline-start: auto;
  }

  .duration,
  .count {
    font-family: monospace;
    font-size: var(--font-size-xs);
  }
}
</style>