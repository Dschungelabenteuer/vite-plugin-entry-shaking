<script setup lang="ts">
import Checkbox from '@component/Checkbox.vue';
import { useClassNames } from '@composable/useClassNames';

const $class = useClassNames('wildcards-filters');
const model = defineModel<('direct' | 'named')[]>();
</script>

<template>
  <div :class="$class()">
    <h3>Filter wildcards</h3>
    <Checkbox
      id="entry-wildcards-filter"
      v-model="model"
      :options="[
        {
          label: 'Named wildcards',
          value: 'named',
        },
        {
          label: 'Direct wildcards',
          value: 'direct',
        },
      ]"
    />
  </div>
</template>

<style>
.wildcards-filters {
  margin: var(--spacing-md);
}
</style>
