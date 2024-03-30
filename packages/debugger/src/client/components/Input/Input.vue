<script setup lang="ts">
import { computed } from 'vue';

import { randomId } from '#utils';
import Kbd from '@components/Kbd/Kbd.vue';
import Icon from '@components/Icon/Icon.vue';
import { useClassNames } from '@composables/useClassNames';
import type { InputProps, InputSlots } from './Input.types';

const $class = useClassNames('input');
const slots = defineSlots<InputSlots>();
const model = defineModel<string>();
const props = withDefaults(defineProps<InputProps>(), {
  id: () => randomId('input'),
});

const classes = computed(() => [$class('wrapper')]);
const inputClasses = computed(() => [
  $class(),
  props.icon ? 'has-icon' : '',
  slots.before ? 'has-before' : '',
  slots.after ? 'has-after' : '',
]);

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div :class="classes">
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
        :id="id"
        v-model="model"
        v-bind="$attrs"
        :class="inputClasses"
        :disabled="disabled"
        :readonly="readonly"
        type="text"
        :placeholder="placeholder"
      />

      <Kbd
        v-if="shortcut"
        :class="['condensed', 'dimmed']"
        :content="shortcut"
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
@include color-scheme(light) {
  --input-border-color: var(--overall-border-color);
  --input-shortcut-opacity: 0.5;
}

@include color-scheme(dark) {
  --input-border-color: var(--overall-border-color-stronger);
  --input-shortcut-opacity: 0.28;
}

.input {
  height: var(--input-height, 2.45rem);
  padding: var(--spacing-md) var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--field-text-color);
  background-color: var(--field-background-color);
  border: none;
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--input-border-color);
  transition:
    box-shadow ease var(--transition-duration-short),
    color ease var(--transition-duration-short);

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
    color: var(--field-text-color-hover);
    background-color: var(--field-background-color-hover);
    box-shadow: 0 0 0 1px var(--field-border-color-hover);
  }

  &:focus {
    color: var(--field-text-color-focus);
    background-color: var(--field-background-color-focus);
    outline: 0;
    box-shadow: 0 0 0 2px var(--field-border-color-focus);
  }

  &:disabled {
    cursor: not-allowed;
    background: var(--field-disabled-background-color);
  }

  & + .kbd {
    position: absolute;
    top: calc(50% - var(--input-kbd-height) / 2);
    right: 0;
    height: var(--input-kbd-height);
    pointer-events: none;
  }

  &__wrapper {
    --input-height: 2rem;
    --button-height: 2rem;
    --input-kbd-height: 1.25rem;

    position: relative;
    display: flex;
    align-items: center;
    margin-inline: var(--spacing-sm);
  }

  &__icon {
    position: absolute;
    top: 0;
    left: var(--spacing-md);
    display: flex;
    align-items: center;
    height: 100%;
    pointer-events: none;
  }

  &__container {
    position: relative;

    &:focus-within {
      color: var(--field-text-color-focus);
    }
  }

  &__before,
  &__after {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--input-height);
    background-color: var(--field-background-color);
    box-shadow: 0 0 0 1px var(--input-border-color);
  }

  &__before {
    border-start-start-radius: var(--radius-md);
    border-end-start-radius: var(--radius-md);
  }

  &__after {
    border-start-end-radius: var(--radius-md);
    border-end-end-radius: var(--radius-md);
  }
}
</style>
