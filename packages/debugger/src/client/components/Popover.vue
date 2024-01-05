<script setup lang="ts">
import { computed } from 'vue';
import { useClassNames } from '@composable/useClassNames';

type PopoverProps = { isOpen: boolean };
type PopoverEvents = { close: [] };

const $class = useClassNames('popover');
const emit = defineEmits<PopoverEvents>();
const props = defineProps<PopoverProps>();

const stateClass = computed(() => (props.isOpen ? 'open' : ''));
const popoverClass = computed(() => [$class(), stateClass.value]);
</script>

<template>
  <div
    :class="$class('wrapper')"
    @keyup.esc="emit('close')"
  >
    <div
      tabindex="-1"
      :class="popoverClass"
    >
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
@include color-scheme(light) {
  --popover-background-color: var(--overall-background-color);
  --popover-border-color: var(--overall-border-color);
}

@include color-scheme(dark) {
  --popover-background-color: #ccaaff18;
  --popover-border-color: #ccaaff22;
}

.popover {
  @include padding;
  width: max-content;
  margin-block: var(--spacing-sm);
  margin-inline: var(--spacing-md);
  border-radius: var(--radius-md);
  transform: translateY(calc(var(--spacing-md) * -2));
  opacity: 0;
  visibility: hidden;
  scale: 0.94;
  background: var(--popover-background-color);
  box-shadow:
    0 0 0 1px var(--popover-border-color),
    0.4px 0.7px 0.9px hsl(var(--shadow-color) / 0.22),
    1.1px 2px 2.6px -0.8px hsl(var(--shadow-color) / 0.22),
    2.7px 4.8px 6.2px -1.7px hsl(var(--shadow-color) / 0.22),
    6.5px 11.4px 14.8px -2.5px hsl(var(--shadow-color) / 0.22);
  transition: all var(--easing-backwards) var(--transition-duration-short);

  &.open {
    visibility: visible;
    opacity: 0.94;
    scale: 1;
    transform: translateY(0);
    backdrop-filter: var(--blur-lg);
    transition: all var(--easing-forwards) var(--transition-duration-medium);
  }

  &__wrapper {
    z-index: 90;
  }
}
</style>
