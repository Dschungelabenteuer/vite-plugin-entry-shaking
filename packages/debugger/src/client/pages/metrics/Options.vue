<script setup lang="ts">
import { store } from '#store';
import { ref } from 'vue';
import Metric from '@components/Metric/Metric.vue';
import { useClassNames } from '@composables/useClassNames';
import type { DiagnosticsProps } from './Metrics.types';

const $class = useClassNames('diagnostics');
</script>

<template>
  <div :class="$class()">
    <Metric
      v-bind="header"
      class="metrics__header"
    />
  </div>
</template>

<style lang="scss">
.options {
  position: relative;
  max-height: 100%;
  margin: var(--spacing-lg);
  overflow: hidden;

  &__list {
    max-height: 100%;
    padding-block-start: var(--spacing-md);
    overflow: auto;

    ul {
      padding: 0;
      margin: 0;
    }
  }

  &__button {
    width: 100%;
    margin-block: var(--spacing-md);
  }
}
</style>
