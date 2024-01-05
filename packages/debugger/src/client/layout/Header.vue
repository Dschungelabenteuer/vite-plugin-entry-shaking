<script setup lang="ts">
import { useClassNames } from '@composable/useClassNames';
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
</script>

<template>
  <header :class="$class()">
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
</style>
