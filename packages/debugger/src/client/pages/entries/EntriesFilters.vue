<script setup lang="ts">
import Checkbox from '@component/Checkbox.vue';
import { useClassNames } from '@composable/useClassNames';

const $class = useClassNames('entries-filters');
const model = defineModel<('implicit' | 'explicit')[]>();
</script>

<template>
  <div :class="$class()">
    <h3>Filter entries</h3>
    <Checkbox
      id="entries-filters"
      v-model="model"
      :options="[
        {
          label: 'Implicit entries',
          value: 'implicit',
        },
        {
          label: 'Explicit entries',
          value: 'explicit',
        },
      ]"
    />
  </div>
</template>

<style>
.entries-filters {
}
</style>
