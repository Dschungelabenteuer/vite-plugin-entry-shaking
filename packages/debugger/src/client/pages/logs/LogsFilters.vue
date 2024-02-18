<script setup lang="ts">
import type { LogLevel } from 'vite-plugin-entry-shaking';
import Checkbox from '@component/Checkbox.vue';
import { useClassNames } from '@composable/useClassNames';

const $class = useClassNames('exports-filters');
const model = defineModel<LogLevel[]>();
</script>

<template>
  <div :class="$class()">
    <h3>Filter log levels</h3>
    <Checkbox
      id="logs-filters"
      v-model="model"
      :options="[
        { label: 'Debug', value: 'debug' },
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warn' },
        { label: 'Error', value: 'error' },
        { label: 'Success', value: 'success' },
      ]"
    />
  </div>
</template>

<style>
.logs-filters {
  margin: var(--spacing-md);
}
</style>
