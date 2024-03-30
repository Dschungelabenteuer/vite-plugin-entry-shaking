<script setup lang="ts">
import { computed } from 'vue';
import { useClassNames } from '@composables/useClassNames';
import type { TooltipProps, TooltipSlots } from './Tooltip.types';

const $class = useClassNames('tooltip');
const slots = defineSlots<TooltipSlots>();
const props = defineProps<TooltipProps>();

const stateClass = computed(() => (props.isOpen ? 'open' : ''));
const tooltipClass = computed(() => [$class(), stateClass.value]);
</script>

<template>
  <div :class="$class('wrapper')">
    <div :class="tooltipClass">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
@include color-scheme(light) {
  --tooltip-background-color: var(--accent-color);
  --tooltip-text-color: var(--accent-color-contrast);
}

@include color-scheme(dark) {
  --tooltip-background-color: var(--accent-color);
  --tooltip-text-color: var(--accent-color-contrast);
}

.tooltip {
  z-index: 10000000;
  width: max-content;
  font-weight: 600;
  color: var(--tooltip-text-color);
  background: var(--tooltip-background-color);
  border-radius: var(--radius-md);
  opacity: 0;
  transition: all var(--easing-backwards) var(--transition-duration-short);
  transform: translateY(calc(var(--spacing-sm) * -1));

  @include padding;

  &.open {
    opacity: 0.875;
    transition: all var(--easing-forwards) var(--transition-duration-medium);
    transform: translateY(0);
  }

  &__wrapper {
    z-index: 10000;
    pointer-events: none;
  }
}
</style>
