<script setup lang="ts">
import { computed } from 'vue';

type TooltipProps = { isOpen: boolean };

const props = defineProps<TooltipProps>();
const baseClass = 'tooltip';
const tooltipClass = computed(() => [baseClass, props.isOpen ? 'open' : '']);
</script>

<template>
  <div class="tooltip-wrapper">
    <div :class="tooltipClass">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
@import '../styles/mixins';

.tooltip-wrapper {
  pointer-events: none;
}

.tooltip {
  @include padding;
  width: max-content;
  margin: var(--spacing-md);
  background: #00000055;
  border-radius: var(--radius-md);
  transform: translateY(calc(var(--spacing-sm) * -1));
  transition: all ease 170ms;
  opacity: 0;
  background: var(--accent-color);
  color: var(--accent-color-contrast);
  font-weight: 600;

  &.open {
    opacity: 0.8;
    transform: translateY(0);
  }
}
</style>
