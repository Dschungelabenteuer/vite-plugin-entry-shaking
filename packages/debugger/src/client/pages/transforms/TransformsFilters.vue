<script setup lang="ts">
import Checkbox from '@component/Checkbox.vue';
import { useClassNames } from '@composable/useClassNames';

const $class = useClassNames('transforms-filters');
const model = defineModel<('implicit' | 'explicit')[]>();
</script>

<template>
  <div :class="$class()">
    <h3>Filter transforms</h3>
    <Checkbox
      id="transform-filters"
      v-model="model"
      :options="[]"
    />
  </div>
</template>

<style>
.transforms-filters {
  margin: var(--spacing-md);
}
</style>
