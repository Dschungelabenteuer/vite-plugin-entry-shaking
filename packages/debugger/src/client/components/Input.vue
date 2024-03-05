<script setup lang="ts">
import { computed } from 'vue';
import Kbd from '@component/Kbd.vue';
import Icon from '@component/Icon.vue';
import { useClassNames } from '@composable/useClassNames';

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
  /** If specified, adds a shortcut hint to button action. */
  shortcut?: string;
};

type Inputlots = {
  /** Rendered before input (but after label). */
  before?: () => any;
  /** Rendered after input. */
  after?: () => any;
};

const $class = useClassNames('input');
const props = defineProps<InputProps>();
const slots = defineSlots<Inputlots>();
const model = defineModel<string>();

const classes = computed(() => [$class('wrapper')]);
const inputClasses = computed(() => [
  $class(),
  props.icon ? 'has-icon' : '',
  slots.before ? 'has-before' : '',
  slots.after ? 'has-after' : '',
]);
</script>

<template>
  <div :class="classes">
    <label
      v-if="!hideLabel"
      :for="id"
    >
      {{ label }}
    </label>

    <div
      v-if="slots.before"
      :class="$class('before')"
    >
      <slot name="before" />
    </div>
    <div :class="$class('container')">
      <Icon
        v-if="icon"
        :class="$class('icon')"
        :name="icon"
      />
      <input
        v-model="model"
        :class="inputClasses"
        :aria-label="!hideLabel ? undefined : label"
        type="text"
        :placeholder="placeholder"
      />

      <Kbd
        v-if="shortcut"
        :content="shortcut"
        :condensed="true"
        :dimmed="true"
      />
    </div>
    <div
      v-if="slots.after"
      :class="$class('after')"
    >
      <slot name="after" />
    </div>
  </div>
</template>

<style lang="scss">
@import '../styles/mixins';

@include color-scheme(light) {
  --input-border-color: var(--overall-border-color);
  --input-shortcut-opacity: 0.5;
}

@include color-scheme(dark) {
  --input-border-color: var(--overall-border-color-stronger);
  --input-shortcut-opacity: 0.28;
}

.input__wrapper {
  --input-height: 2rem;
  --button-height: 2rem;
  --input-kbd-height: 1.25rem;

  display: flex;
  align-items: center;
  margin-inline: var(--spacing-sm);
  position: relative;
}

.input__icon {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: var(--spacing-md);
  height: 100%;
  display: flex;
  align-items: center;
}

.input__container {
  position: relative;
}

.input__before,
.input__after {
  height: var(--input-height);
  background-color: var(--field-background-color);
  box-shadow: 0 0 0 1px var(--input-border-color);
}

.input__before {
  border-start-start-radius: var(--radius-md);
  border-end-start-radius: var(--radius-md);
}

.input__after {
  border-start-end-radius: var(--radius-md);
  border-end-end-radius: var(--radius-md);
}

.input {
  height: var(--input-height);
  padding: var(--spacing-md) var(--spacing-md);
  border-radius: var(--radius-md);
  border: none;
  transition:
    box-shadow ease var(--transition-duration-short),
    color ease var(--transition-duration-short);
  background-color: var(--field-background-color);
  box-shadow: 0 0 0 1px var(--input-border-color);
  color: var(--field-text-color);

  &.has-icon {
    padding-inline-start: var(--input-height);
  }

  &.has-before {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  &.has-after {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  &:hover {
    background-color: var(--field-background-color-hover);
    box-shadow: 0 0 0 1px var(--field-border-color-hover);
    color: var(--field-text-color-hover);

    &:not(:focus) {
      & + .kbd {
        opacity: var(--input-shortcut-opacity);
      }
    }
  }

  &:focus {
    outline: 0;
    background-color: var(--field-background-color-focus);
    box-shadow: 0 0 0 2px var(--field-border-color-focus);
    color: var(--field-text-color-focus);
  }

  & + .kbd {
    transition: opacity ease var(--transition-duration-short);
    height: var(--input-kbd-height);
    top: calc(50% - var(--input-kbd-height) / 2);
    pointer-events: none;
    position: absolute;
    right: 0;
    opacity: 0;
  }
}
</style>
