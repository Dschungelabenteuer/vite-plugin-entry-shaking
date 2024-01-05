<script setup lang="ts">
import { ref } from 'vue';
import Checkbox from '@component/Checkbox.vue';

const props = defineProps<{ filters: string[] }>();
const emit = defineEmits<{ filter: [filters: string[]] }>();
const modelValue = ref<string[]>(props.filters);
const updateFilters = (filterList: string[]) => {
  emit('filter', filterList);
};
</script>

<template>
  <div class="transforms-filter">
    <h3>Filter log levels</h3>
    <Checkbox
      id="transform-levels-filter"
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
.transforms-filter {
  margin: var(--spacing-md);
}
</style>
