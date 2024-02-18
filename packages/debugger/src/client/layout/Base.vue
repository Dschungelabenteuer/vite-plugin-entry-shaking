<script setup lang="ts">
import { provide } from 'vue';

import { useColorScheme } from '@composable/useColorScheme';
import { usePanel } from '@composable/usePanel';
import Header from './Header.vue';
import Footer from './Footer.vue';
import MetricsPanel from './MetricsPanel.vue';

const { colorScheme, swapColorScheme } = useColorScheme();
const metricsPanel = usePanel('metrics');
const { isOpen } = metricsPanel;
provide('metricsPanel', metricsPanel);
provide('colorScheme', colorScheme);
provide('swapColorScheme', swapColorScheme);
</script>

<template>
  <div
    class="theme-wrapper"
    :data-color-scheme="colorScheme"
  >
    <div
      class="layout-wrapper"
      tabindex="0"
    >
      <Header />
      <main>
        <slot />
      </main>
      <Footer />
    </div>
    <MetricsPanel
      v-show="isOpen"
      class="panel"
    />
  </div>
</template>

<style lang="scss">
.theme-wrapper {
  @include contained;
  display: flex;
  color: var(--text-color);
  background: var(--background-color);
  background-image: var(--background-gradient);
}

.layout-wrapper {
  @include contained;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: var(--size-header) 1fr var(--size-footer);

  main {
    container: main / inline-size;
  }
}

main {
  flex-grow: 1;
  border-radius: var(--radius-md);
  max-height: var(--size-page);
  overflow-y: auto;
}
</style>
