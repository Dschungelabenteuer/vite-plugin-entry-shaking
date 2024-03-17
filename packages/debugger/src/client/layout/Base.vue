<script setup lang="ts">
import { inject, onMounted, provide, ref } from 'vue';

import { store } from '#store';
import { useColorScheme } from '@composable/useColorScheme';
import { usePanel } from '@composable/usePanel';
import { FLOATING_CONTAINER_CLASS, FLOATING_CONTAINER_ID_VAR } from '@composable/useFloating';
import Header from './Header.vue';
import Footer from './Footer.vue';
import MetricsPanel from './MetricsPanel.vue';

const enableTeleports = ref(false);
const { colorScheme, swapColorScheme } = useColorScheme();
const metricsPanel = usePanel('metrics');
const { isOpen } = metricsPanel;
const floatingContainerId = inject<string>(FLOATING_CONTAINER_ID_VAR)!;
provide('metricsPanel', metricsPanel);
provide('colorScheme', colorScheme);
provide('swapColorScheme', swapColorScheme);
provide('enableTeleports', enableTeleports);

onMounted(() => {
  enableTeleports.value = true;
});
</script>

<template>
  <div
    class="theme-wrapper"
    :data-color-scheme="colorScheme"
  >
    <div
      :id="floatingContainerId"
      :class="FLOATING_CONTAINER_CLASS"
    />
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
  grid-template-rows: var(--size-header) 1fr var(--size-footer);
  grid-template-columns: 1fr;
}
</style>
