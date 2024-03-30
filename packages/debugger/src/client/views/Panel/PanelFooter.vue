<script setup lang="ts">
import { inject } from 'vue';

import type { ClassNameFn } from '@composables/useClassNames';
import type { PanelSlots } from './Panel.types';

const $class = inject<ClassNameFn>('$class')!;
const slots = defineSlots<Pick<PanelSlots, 'footer'>>();
</script>

<template>
  <footer :class="$class('footer')">
    <slot name="footer" />
  </footer>
</template>

<style lang="scss">
.panel {
  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 1px var(--overall-border-color);

    > * {
      margin-inline: var(--spacing-sm);
    }
  }
}
</style>
