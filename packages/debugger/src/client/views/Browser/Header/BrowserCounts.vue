<script setup lang="ts">
import { inject, ref } from 'vue';

import type { ClassNameFn } from '@composables/useClassNames';
import { useViewTransition } from '@composables/useViewTransition';
import type { BrowserProps } from '../Browser.types';

const $class = inject<ClassNameFn>('$class')!;
const props = defineProps<Required<BrowserProps>>();

const headerCountsRef = ref<HTMLElement | null>(null);
const transitions = useViewTransition({
  names: {
    'browser-header-counts': headerCountsRef,
  },
});
</script>

<template>
  <div
    ref="headerCountsRef"
    :class="$class('header-counts')"
  >
    <span v-if="total === matched">{{ total }} items</span>
    <span v-else>{{ matched }} / {{ total }} items</span>
  </div>
</template>

<style lang="scss">
.browser-view {
  &__header-counts {
    @include padding;

    margin: var(--spacing-md);
    font-size: var(--font-size-2xs);
    border-radius: var(--radius-md);
    box-shadow: 0 0 0 1px var(--overall-border-color-stronger);
  }
}
</style>
