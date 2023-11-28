<script setup lang="ts">
import { inject } from 'vue';
import type { ChannelStore } from '..';
import Navigation from './Navigation.vue';

type HeaderProps = {
  showTitle?: boolean;
  showNavigation?: boolean;
};

withDefaults(defineProps<HeaderProps>(), { showTitle: true, showNavigation: true });
const store = inject<ChannelStore>('store')!;
</script>

<template>
  <header class="header">
    <router-link
      v-if="showTitle"
      class="header__title"
      to="/"
    >
      {{ store.name }} example
    </router-link>
    <Navigation v-if="showNavigation" />
  </header>
</template>

<style lang="scss">
@import '../styles/mixins';

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
  }

  .navigation {
    margin-inline-start: auto;
  }
}
</style>
