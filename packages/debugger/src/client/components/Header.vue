<script setup lang="ts">
import Navigation from './Navigation.vue';
import { store } from '../store';

type HeaderProps = {
  showTitle?: boolean;
  showNavigation?: boolean;
};

withDefaults(defineProps<HeaderProps>(), { showTitle: true, showNavigation: true });
</script>

<template>
  <header class="header">
    <router-link
      v-if="showTitle"
      class="header__title"
      to="/"
    >
      VPES&nbsp;debugger
    </router-link>
    <Navigation v-if="showNavigation" />
  </header>
</template>

<style lang="scss">
@import '../styles/mixins';
@import '../styles/variables';

.header {
  @include flex(normal, center);
  @include border-bottom;
  padding-inline-start: var(--spacing-md);
  background: var(--overall-background-color);

  &__title {
    @include flex(normal, center);
    padding-inline: var(--spacing-md);
    color: var(--text-color);
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
