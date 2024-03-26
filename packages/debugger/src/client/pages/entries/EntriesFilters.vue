<script setup lang="ts">
import type { CheckboxProps } from '@components/Checkbox/Checkbox.types';
import Checkboxes from '@components/Checkboxes/Checkboxes.vue';
import { useClassNames } from '@composables/useClassNames';

const $class = useClassNames('entries-filters');
const model = defineModel<('implicit' | 'explicit')[]>();
const options: CheckboxProps[] = [
  {
    label: 'Implicit entries',
    value: 'implicit',
  },
  {
    label: 'Explicit entries',
    value: 'explicit',
  },
];
</script>

<template>
  <div :class="$class()">
    <h3>Filter entries</h3>
    <Checkboxes
      id="entries-filters"
      v-model="model"
      :options="options"
    />
  </div>
</template>
