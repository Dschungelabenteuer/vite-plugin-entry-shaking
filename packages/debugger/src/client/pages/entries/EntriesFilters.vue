<script setup lang="ts">
import { ref } from 'vue';
import { useClassNames } from '@composable/useClassNames';
import Checkbox from '@component/Checkbox.vue';

const $class = useClassNames('entries-filter');
const emit = defineEmits<{ filter: [filters: string[]] }>();
const props = defineProps<{ filters: string[] }>();

const modelValue = ref<string[]>(props.filters);
const updateFilters = (filterList: string[]) => {
  emit('filter', filterList);
};
</script>

<template>
  <div :class="$class()">
    <h3>Filter log levels</h3>
    <Checkbox
      id="entry-levels-filter"
      :model-value="modelValue"
      :options="[
        { label: 'Debug', value: 'debug' },
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warn' },
        { label: 'Error', value: 'error' },
      ]"
      @update:model-value="updateFilters"
    />
  </div>
</template>

<style>
.entries-filter {
  margin: var(--spacing-md);
}
</style>
