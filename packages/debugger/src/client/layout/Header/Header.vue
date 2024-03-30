<script setup lang="ts">
import { ref } from 'vue';

import Navigation from '@layout/Navigation/Navigation.vue';
import RouterButton from '@components/RouterButton/RouterButton.vue';
import { useClassNames } from '@composables/useClassNames';
import { useViewTransition } from '@composables/useViewTransition';
import type { HeaderProps } from './Header.types';

const $class = useClassNames('header');
const props = withDefaults(defineProps<HeaderProps>(), {
  showTitle: true,
  showNavigation: true,
});

const headerRef = ref<HTMLElement | null>(null);
useViewTransition({ names: { 'layout-header': headerRef } });
</script>

<template>
  <header
    ref="headerRef"
    :class="$class()"
  >
    <div :class="$class('title')">
      <RouterButton
        href="/"
        label="VPES debugger"
      />
    </div>
    <Navigation v-if="showNavigation" />
  </header>
</template>

<style lang="scss">
.header {
  z-index: 10;
  padding-inline-start: var(--spacing-md);
  background: var(--overall-background-color);

  @include flex(normal, center);
  @include border-bottom;

  &__title {
    .button {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--text-emphasize-color);
    }

    @media (max-width: $breakpoint-sm) {
      display: none;
    }
  }

  .navigation {
    margin-inline-start: auto;
  }
}

::view-transition-new(layout-header),
::view-transition-old(layout-header) {
  animation: none;
}

::view-transition-old(layout-header) {
  display: none;
}
</style>
