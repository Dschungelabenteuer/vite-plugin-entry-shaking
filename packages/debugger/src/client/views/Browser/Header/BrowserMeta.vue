<script setup lang="ts">
import { inject, ref } from 'vue';

import Icon from '@components/Icon/Icon.vue';
import type { ClassNameFn } from '@composables/useClassNames';
import { useViewTransition } from '@composables/useViewTransition';
import type { BrowserProps } from '../Browser.types';

const $class = inject<ClassNameFn>('$class')!;
const props = defineProps<Required<BrowserProps>>();

const headerTitleRef = ref<HTMLElement | null>(null);
const headerIconRef = ref<HTMLElement | null>(null);
const transitions = useViewTransition({
  names: {
    'browser-header-title': headerTitleRef,
    'browser-header-icon': headerIconRef,
  },
});
</script>

<template>
  <div :class="$class('header-meta')">
    <div
      ref="headerIconRef"
      :class="$class('header-icon')"
    >
      <Icon
        v-if="pageIcon"
        :name="pageIcon"
      />
    </div>
    <h1
      ref="headerTitleRef"
      :class="$class('header-title')"
    >
      {{ name }}
    </h1>
  </div>
</template>

<style lang="scss">
.browser-view {
  &__header-meta {
    @include flex-row(normal, center);

    svg {
      margin-inline-end: var(--spacing-md);
      font-size: var(--font-size-lg);
    }
  }
}

::view-transition-new(browser-header-icon) {
  animation: 300ms ease scale-in forwards;
}

::view-transition-old(browser-header-icon) {
  animation: 300ms ease scale-out forwards;
}

::view-transition-new(browser-header-title) {
  --slide-in-distance: 0.8rem;

  width: fit-content;
  height: fit-content;
  overflow: clip;
  object-fit: cover;
  animation: 200ms ease slide-in-left forwards;
}

::view-transition-old(browser-header-title) {
  --slide-in-distance: 0.8rem;

  width: fit-content;
  height: fit-content;
  object-fit: cover;
  animation: 200ms ease slide-out-right forwards;
}
</style>
