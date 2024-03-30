<script setup lang="ts">
import Checkbox from '@components/Checkbox/Checkbox.vue';
import { useClassNames } from '@composables/useClassNames';
import type { CheckboxesProps } from './Checkboxes.types';

const $class = useClassNames('checkboxes');
const props = defineProps<CheckboxesProps>();
const model = defineModel<string[]>({ default: () => [] });
</script>

<template>
  <div :class="$class('container')">
    <Checkbox
      v-for="(option, idx) in options"
      :id="`${id}-${idx}`"
      :key="`${id}-${idx}`"
      v-model="model"
      :value="option.value"
      :label="option.label"
      :disabled="disabled || option.disabled"
    />
  </div>
</template>

<style lang="scss">
.checkboxes {
  &__container {
    display: flex;
    flex-direction: column;
    margin-block: var(--spacing-sm);
  }
}
</style>
