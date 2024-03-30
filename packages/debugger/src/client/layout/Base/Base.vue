<script setup lang="ts">
import { inject, onMounted, provide, ref } from 'vue';

import Header from '@layout/Header/Header.vue';
import Footer from '@layout/Footer/Footer.vue';
import { DIALOG_CONTAINER_CLASS, DIALOG_CONTAINER_ID_VAR } from '@components/Dialog/useDialog';
import Toaster from '@components/Toast/Toaster.vue';
import { useToaster } from '@components/Toast/useToaster';
import { FLOATING_CONTAINER_CLASS, FLOATING_CONTAINER_ID_VAR } from '@composables/useFloating';
import { useColorScheme } from '@composables/useColorScheme';
import { usePanel } from '@views/Panel/usePanel';
import Metrics from '@pages/metrics/Metrics.vue';
import type { BaseSlots } from './Base.types';

const slots = defineSlots<BaseSlots>();
const dialogContainerId = inject<string>(DIALOG_CONTAINER_ID_VAR)!;
const floatingContainerId = inject<string>(FLOATING_CONTAINER_ID_VAR)!;

const enableTeleports = ref(false);
const toasterRef = ref<InstanceType<typeof Toaster> | null>(null);
const { colorScheme, swapColorScheme } = useColorScheme();
const metricsPanel = usePanel('metrics');
const toaster = useToaster(toasterRef);
const { isOpen } = metricsPanel;

provide('$toaster', toaster);
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
      :id="dialogContainerId"
      :class="DIALOG_CONTAINER_CLASS"
      style="view-transition-name: oh"
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
    <Metrics v-show="isOpen" />
    <Toaster ref="toasterRef" />
  </div>
</template>

<style lang="scss">
.layout-wrapper {
  @include contained;

  display: grid;
  grid-template-rows: var(--size-header) 1fr var(--size-footer);
  grid-template-columns: 1fr;
}
</style>
