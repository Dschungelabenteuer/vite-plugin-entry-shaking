<script setup lang="ts">
import { store } from '#store';
import Metric from '@components/Metric/Metric.vue';
import { useClassNames } from '@composables/useClassNames';

const $class = useClassNames('diagnostics');
</script>

<template>
  <div :class="$class()">
    <Metric
      :class="$class('header')"
      icon="alert-triangle"
      label="Diagnostics"
      value="667"
      type="count"
    />
  </div>
</template>

<style lang="scss">
.diagnostics {
  margin: var(--spacing-lg);

  &__header {
    display: flex;
    align-items: center;
    padding: var(--spacing-md);
    font-size: var(--font-size-md);
    color: var(--text-emphasize-color);
  }
}
</style>
