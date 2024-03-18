<script setup lang="ts">
import Icon from '@component/Icon.vue';
import { useClassNames } from '@composable/useClassNames';
import type { CheckboxProps } from './Checkbox.types';

const $class = useClassNames('checkbox');
const props = defineProps<CheckboxProps>();
const model = defineModel<boolean>();
</script>

<template>
  <div :class="$class('option')">
    <Icon
      :class="$class('mark')"
      name="check"
    />
    <input
      :id
      v-model="model"
      :value="true"
      type="checkbox"
      :disabled="disabled"
    />
    <label :for="id">
      {{ label }}
    </label>
  </div>
</template>

<style lang="scss">
@include color-scheme {
  --checkbox-checkmark-color: var(--accent-color);
  --checkbox-border-color: var(--field-border-color);
  --checkbox-border-color-focus: var(--field-border-color-focus);
  --checkbox-border-color-hover: var(--field-border-color-hover);
}

@include color-scheme(light) {
  --checkbox-background-color: var(--field-background-color);
}

@include color-scheme(dark) {
  --checkbox-background-color: transparent;
}

.checkbox {
  &__mark {
    position: absolute;
    color: var(--checkbox-checkmark-color);
    opacity: 0;
    transition: all ease var(--transition-duration-short);
    transform: scale(0.675, 0.875);
  }

  &__option {
    --checkbox-size: 1rem;
    --checkbox-margin: calc(var(--spacing-md) + 2px);
    --checkbox-offset: calc(var(--checkbox-size) + var(--checkbox-margin));

    position: relative;
    display: flex;
    align-items: center;
    padding-inline-end: var(--checkbox-offset);
    margin: var(--spacing-sm);
    transition: all ease var(--transition-duration-short);

    input {
      position: absolute;
      width: 100%;
      height: 100%;
      cursor: pointer;
      opacity: 0;

      &:disabled {
        cursor: not-allowed;
      }
    }

    label {
      pointer-events: none;
      transition: all ease var(--transition-duration-short);
      transform: translateX(var(--checkbox-offset));
    }

    &::before {
      position: absolute;
      width: var(--checkbox-size);
      height: var(--checkbox-size);
      content: '';
      background-color: var(--checkbox-background-color);
      border-radius: var(--radius-sm);
      box-shadow: 0 0 0 1px var(--checkbox-border-color);
      transition: all ease var(--transition-duration-short);
    }

    &:has(input:disabled) {
      opacity: 0.45;

      &::before {
        background-color: var(--overall-border-color);
        opacity: 0.825;
      }
    }

    &:has(input:checked) {
      &::before {
        box-shadow: 0 0 0 1.5px var(--checkbox-border-color-focus);
      }

      .checkbox {
        &__mark {
          opacity: 1;
          transform: scale(0.75, 1);
        }
      }
    }

    &:has(input:hover:not(:disabled, :focus, :checked)) {
      &::before {
        box-shadow: 0 0 0 1px var(--checkbox-border-color-hover);
      }

      label {
        color: var(--text-emphasize-color);
      }
    }

    &:has(input:focus:not(:disabled)) {
      &::before {
        box-shadow: 0 0 0 2px var(--checkbox-border-color-focus);
      }
    }
  }
}
</style>
