<script setup lang="ts">
import { computed } from 'vue';
import Icon from '@components/Icon/Icon.vue';
import { useClassNames } from '@composables/useClassNames';
import type { ToastProps, ToastSlots } from './Toast.types';

const $class = useClassNames('toast');
const slots = defineSlots<ToastSlots>();
const props = defineProps<ToastProps>();
const classes = computed(() => [$class(), props.type]);
const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'circle-check';
    case 'error':
      return 'circle-x';
    case 'loading':
      return 'refresh';
    case 'warning':
      return 'alert-triangle';
    default:
      return 'exclamation-circle';
  }
});
</script>

<template>
  <div :class="classes">
    <Icon :name="icon" />
    <div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
@include color-scheme(light) {
  --toast-background-color: var(--overall-background-color);
  --toast-border-color: var(--overall-border-color);
}

@include color-scheme(dark) {
  --toast-background-color: #1a1318cc;
  --toast-border-color: #caf2;
}

.toast {
  --toast-padding-inline: var(--spacing-md);
  --toast-padding-block: var(--spacing-lg);
  --toast-margin-inline: var(--spacing-md);
  --toast-margin-block: var(--spacing-sm);

  z-index: 1090;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  padding-block: var(--toast-padding-block);
  padding-inline: var(--toast-padding-inline);
  margin-block: var(--toast-margin-block);
  margin-inline: var(--toast-margin-inline);
  pointer-events: none;
  background: var(--toast-background-color);
  backdrop-filter: blur(4px);
  border-inline-start: 5px solid;
  border-radius: var(--radius-md);
  box-shadow:
    0 0 0 1px var(--toast-border-color),
    0.4px 0.7px 0.9px hsl(var(--shadow-color) / 22%),
    1.1px 2px 2.6px -0.8px hsl(var(--shadow-color) / 22%),
    2.7px 4.8px 6.2px -1.7px hsl(var(--shadow-color) / 22%),
    6.5px 11.4px 14.8px -2.5px hsl(var(--shadow-color) / 22%);
  transition:
    opacity ease 600ms,
    scale ease 600ms;

  svg {
    margin-inline: var(--spacing-md);
  }

  &.success {
    color: var(--status-color-success);
    border-color: var(--status-color-success);
  }

  &.error {
    color: var(--status-color-error);
    border-color: var(--status-color-error);
  }

  &.warning {
    color: var(--status-color-warn);
    border-color: var(--status-color-warn);
  }

  &.info {
    color: var(--status-color-info);
    border-color: var(--status-color-info);
  }

  &.loading {
    svg {
      animation: spin 800ms infinite linear;

      @media (prefers-reduced-motion: reduce) {
        animation: spin 6s infinite linear;
      }
    }
  }
}
</style>
