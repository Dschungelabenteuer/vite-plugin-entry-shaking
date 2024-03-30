<script setup lang="ts">
import type { CheckboxProps } from '@components/Checkbox/Checkbox.types';
import Checkboxes from '@components/Checkboxes/Checkboxes.vue';
import { useClassNames } from '@composables/useClassNames';

const $class = useClassNames('wildcards-filters');
const model = defineModel<('direct' | 'named')[]>();
const options: CheckboxProps[] = [
  {
    label: 'Named wildcards',
    value: 'named',
  },
  {
    label: 'Direct wildcards',
    value: 'direct',
  },
];
</script>

<template>
  <div :class="$class()">
    <h3>Filter wildcards</h3>
    <Checkboxes
      id="entry-wildcards-filter"
      v-model="model"
      :options="options"
    />
  </div>
</template>

<style>
.wildcards-filters {
  margin: var(--spacing-md);
}
</style>
