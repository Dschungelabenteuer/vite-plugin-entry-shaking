<script setup lang="ts">
import Checkbox from '@component/Checkbox.vue';
import { useClassNames } from '@composable/useClassNames';

const $class = useClassNames('exports-filters');
const model = defineModel<('defaultImport' | 'selfDefined')[]>();
</script>

<template>
  <div :class="$class()">
    <h3>Filter exports</h3>
    <Checkbox
      id="entry-exports-filter"
      v-model="model"
      :options="[
        {
          label: 'Imported via source module\'s default export',
          value: 'defaultImport',
        },
        {
          label: 'Code defined within the entry',
          value: 'selfDefined',
        },
      ]"
    />
  </div>
</template>

<style>
.exports-filters {
  margin: var(--spacing-md);
}
</style>
