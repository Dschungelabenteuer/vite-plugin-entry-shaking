<script setup lang="ts">
import { computed, inject } from 'vue';
import type { ColorScheme } from '../composables/useColorScheme';
import IconButton from './IconButton.vue';
import ViteStatus from './ViteStatus.vue';

const colorScheme = inject<ColorScheme>('colorScheme')!;
const swapColorScheme: () => void = inject('swapColorScheme')!;
const colorSchemeIcon = computed(() => (colorScheme === 'dark' ? 'tabler:sun' : 'tabler:moon'));
</script>

<template>
  <footer class="footer">
    <div class="vite-status">
      <ViteStatus />
    </div>
    <div id="color-scheme-switcher">
      <IconButton
        :icon="colorSchemeIcon"
        size="large"
        label="Toggle color scheme"
        @click="swapColorScheme"
      />
    </div>
  </footer>
</template>

<style lang="scss">
@import '../styles/mixins';

.footer {
  z-index: 100;
  @include flex(normal, center);
  @include border-top;
  padding-inline: var(--spacing-md);
  background: var(--overall-background-color);

  #vite-status {
    margin-inline-end: auto;
  }

  #color-scheme-switcher {
    margin-inline-start: auto;
    height: calc(100% - var(--spacing-md));
    button {
      height: 100%;
    }
  }
}
</style>
