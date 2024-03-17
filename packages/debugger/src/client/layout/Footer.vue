<script setup lang="ts">
import { computed, inject } from 'vue';

import Button from '@component/Button/Button.vue';
import type { ColorScheme } from '@composable/useColorScheme';
import { useClassNames } from '@composable/useClassNames';
import ViteStatus from './ViteStatus.vue';

const $class = useClassNames('footer');

const swapColorScheme = inject<() => void>('swapColorScheme')!;
const colorScheme = inject<ColorScheme>('colorScheme')!;
const colorSchemeIcon = computed(() => (colorScheme === 'dark' ? 'sun' : 'moon'));
</script>

<template>
  <footer :class="$class()">
    <ViteStatus />
    <div id="color-scheme-switcher">
      <Button
        :icon="colorSchemeIcon"
        :icon-only="true"
        class="large"
        label="Toggle color scheme"
        @click="swapColorScheme"
      />
    </div>
  </footer>
</template>

<style lang="scss">
.footer {
  z-index: 100;

  @include flex(normal, center);
  @include border-top;

  padding-inline: var(--spacing-md);
  background: var(--overall-background-color);

  #color-scheme-switcher {
    height: calc(100% - var(--spacing-md));
    margin-inline-start: auto;

    button {
      height: 100%;
    }
  }
}
</style>
