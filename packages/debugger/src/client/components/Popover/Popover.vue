<script setup lang="ts">
import { computed, ref } from 'vue';

import { useClassNames } from '@composables/useClassNames';
import type { PopoverSlots, PopoverEvents, PopoverProps } from './Popover.types';

const $class = useClassNames('popover');
const emit = defineEmits<PopoverEvents>();
const slots = defineSlots<PopoverSlots>();
const props = defineProps<PopoverProps>();

const stateClass = computed(() => (props.isOpen ? 'open' : ''));
const popoverClass = computed(() => [$class(), stateClass.value]);
const isTransitioning = ref(false);
</script>

<template>
  <div
    :class="$class('wrapper')"
    @keyup.esc="emit('close')"
  >
    <div
      tabindex="-1"
      :class="popoverClass"
      @transitionstart="isTransitioning = true"
      @transitionend="isTransitioning = false"
    >
      <slot :is-transitioning />
    </div>
  </div>
</template>

<style lang="scss">
@include color-scheme(light) {
  --popover-background-color: var(--overall-background-color);
  --popover-border-color: var(--overall-border-color);
}

@include color-scheme(dark) {
  --popover-background-color: #1a1318cc;
  --popover-border-color: #caf2;
}

.popover {
  --popover-padding-inline: var(--spacing-md);
  --popover-padding-block: var(--spacing-md);
  --popover-margin-inline: var(--spacing-md);
  --popover-margin-block: var(--spacing-sm);

  z-index: 1090;
  width: 100%;
  min-width: max-content;
  padding-block: var(--popover-padding-block);
  padding-inline: var(--popover-padding-inline);
  margin-block: var(--popover-margin-block);
  margin-inline: var(--popover-margin-inline);
  pointer-events: none;
  visibility: hidden;
  background: var(--popover-background-color);
  border-radius: var(--radius-md);
  box-shadow:
    0 0 0 1px var(--popover-border-color),
    0.4px 0.7px 0.9px hsl(var(--shadow-color) / 22%),
    1.1px 2px 2.6px -0.8px hsl(var(--shadow-color) / 22%),
    2.7px 4.8px 6.2px -1.7px hsl(var(--shadow-color) / 22%),
    6.5px 11.4px 14.8px -2.5px hsl(var(--shadow-color) / 22%);
  opacity: 0;
  transition: all var(--easing-forwards) var(--transition-duration-medium);
  scale: 0.9;

  &.open {
    pointer-events: all;
    visibility: visible;
    backdrop-filter: var(--blur-lg);
    opacity: 0.94;
    transform: translateY(0);
    scale: 1;
  }

  &__wrapper {
    z-index: 1090;
    pointer-events: none;
  }
}
</style>
