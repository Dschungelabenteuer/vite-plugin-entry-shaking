<script setup lang="ts">
import type { CheckboxProps } from '@components/Checkbox/Checkbox.types';
import Checkboxes from '@components/Checkboxes/Checkboxes.vue';
import { useClassNames } from '@composables/useClassNames';

const $class = useClassNames('exports-filters');
const model = defineModel<('defaultImport' | 'selfDefined')[]>();
const options: CheckboxProps[] = [
  {
    label: "Imported via source module's default export",
    value: 'defaultImport',
  },
  {
    label: 'Code defined within the entry',
    value: 'selfDefined',
  },
];
</script>

<template>
  <div :class="$class()">
    <h3>Filter exports</h3>
    <Checkboxes
      id="entry-exports-filter"
      v-model="model"
      :options="options"
    />
  </div>
</template>

<style>
.exports-filters {
  margin: var(--spacing-md);
}
</style>
