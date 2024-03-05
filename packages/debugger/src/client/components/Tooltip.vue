<script setup lang="ts">
import { computed } from 'vue';
import { useClassNames } from '@composable/useClassNames';

type TooltipProps = { isOpen: boolean };

const $class = useClassNames('tooltip');
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
  z-index: 10000;
  @include padding;
  width: max-content;
  margin: var(--spacing-md);
  border-radius: var(--radius-md);
  transform: translateY(calc(var(--spacing-sm) * -1));
  transition: all var(--easing-backwards) var(--transition-duration-short);
  opacity: 0;
  background: var(--tooltip-background-color);
  color: var(--tooltip-text-color);
  font-weight: 600;

  &.open {
    opacity: 0.875;
    transform: translateY(0);
    transition: all var(--easing-forwards) var(--transition-duration-medium);
  }

  &__wrapper {
    z-index: 100;
    pointer-events: none;
  }
}
</style>
