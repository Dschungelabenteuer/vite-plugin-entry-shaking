<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

type InputProps = {
  /** Input ID. */
  id: string;
  /** Input label. */
  label: string;
  /** Should we hide the label? */
  hideLabel?: boolean;
  /** Input placeholder. */
  placeholder?: string;
  /** Input icon. */
  icon?: string;
};

const props = defineProps<InputProps>();

const classes = computed(() => ['input__wrapper', props.icon ? 'has-icon' : '']);
</script>

<template>
  <div :class="classes">
    <Icon
      v-if="icon"
      class="input__icon"
      :icon="`tabler:${icon}`"
    />
    <label
      v-if="!hideLabel"
      :for="id"
    >
      {{ label }}
    </label>
    <input
      class="input"
      :aria-label="!hideLabel ? undefined : label"
      type="text"
      :placeholder="placeholder"
    />
  </div>
</template>

<style lang="scss">
@import '../styles/mixins';

.input__wrapper {
  display: flex;
  align-items: center;
  margin-inline: var(--spacing-sm);

  svg {
    margin-inline: var(--spacing-md);
  }
}

.input {
  padding: var(--spacing-md) var(--spacing-md);
  border-radius: var(--radius-md);
  border: none;
  transition:
    box-shadow ease var(--transition-duration-short),
    color ease var(--transition-duration-short);
  background-color: var(--field-background-color);
  box-shadow: 0 0 0 1px var(--field-border-color-dimmed);
  color: var(--field-text-color);

  &:hover {
    background-color: var(--field-background-color-hover);
    box-shadow: 0 0 0 1px var(--field-border-color-hover);
    color: var(--field-text-color-hover);
  }

  &:focus {
    outline: 0;
    background-color: var(--field-background-color-focus);
    box-shadow: 0 0 0 2px var(--field-border-color-focus);
    color: var(--field-text-color-focus);
  }
}
</style>
