<script setup lang="ts">
import { computed, inject } from 'vue';
import type { ColorScheme } from '../composables/useColorScheme';
import type { ChannelStore } from '../channel';
import IconButton from './IconButton.vue';

const store = inject<ChannelStore>('store')!;
const colorScheme = inject<ColorScheme>('colorScheme')!;
const swapColorScheme: () => void = inject('swapColorScheme')!;
const colorSchemeIcon = computed(() => (colorScheme === 'dark' ? 'tabler:sun' : 'tabler:moon'));
</script>

<template>
  <footer class="footer">
    <div id="requests-count">{{ store.requestCount }} requests were made</div>
    <div id="color-scheme-switcher">
      <IconButton
        :icon="colorSchemeIcon"
        label="Toggle color scheme"
        @click="swapColorScheme"
      />
    </div>
  </footer>
</template>

<style lang="scss">
@import '../styles/mixins';

.footer {
  @include flex(normal, center);
  @include border-top;
  padding-inline: var(--spacing-md);
  background: var(--overall-background-color);

  #requests-count {
    flex-grow: 1;
  }

  #color-scheme-switcher {
    height: calc(100% - var(--spacing-md));
    button {
      height: 100%;
    }
  }
}
</style>
