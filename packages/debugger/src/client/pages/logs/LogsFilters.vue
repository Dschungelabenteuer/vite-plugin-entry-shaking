<script setup lang="ts">
import type { LogLevel } from 'vite-plugin-entry-shaking';
import Checkboxes from '@components/Checkboxes/Checkboxes.vue';
import type { CheckboxProps } from '@components/Checkbox/Checkbox.types';
import { useClassNames } from '@composables/useClassNames';

const $class = useClassNames('logs-filters');
const model = defineModel<LogLevel[]>();
const options: CheckboxProps[] = [
  { label: 'Debug', value: 'debug' },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warn' },
  { label: 'Error', value: 'error' },
  { label: 'Success', value: 'success' },
];
</script>

<template>
  <div :class="$class()">
    <h3>Filter log levels</h3>
    <Checkboxes
      id="logs-filters"
      v-model="model"
      :options="options"
    />
  </div>
</template>

<style>
.logs-filters {
  margin: var(--spacing-md);
}
</style>
