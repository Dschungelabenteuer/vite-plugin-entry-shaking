<script setup lang="ts">
import { ref } from 'vue';
import { useClassNames } from '@composable/useClassNames';
import { useViewTransition } from '@composable/useViewTransition';
import Navigation from './Navigation.vue';

type HeaderProps = {
  showTitle?: boolean;
  showNavigation?: boolean;
};

const $class = useClassNames('header');
const props = withDefaults(defineProps<HeaderProps>(), {
  showTitle: true,
  showNavigation: true,
});

const headerRef = ref<HTMLElement | null>(null);
const transition = useViewTransition({
  names: { 'layout-header': headerRef },
});
</script>

<template>
  <header
    ref="headerRef"
    :class="$class()"
  >
    <router-link
      v-if="showTitle"
      :class="$class('title')"
      to="/"
    >
      VPES&nbsp;debugger
    </router-link>
    <Navigation v-if="showNavigation" />
  </header>
</template>

<style lang="scss">
.header {
  z-index: 10;
  @include flex(normal, center);
  @include border-bottom;
  padding-inline-start: var(--spacing-md);
  background: var(--overall-background-color);

  &__title {
    @include flex(normal, center);
    color: var(--text-emphasize-color);
    padding-inline: var(--spacing-md);
    text-decoration: none;
    font-weight: 600;

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
