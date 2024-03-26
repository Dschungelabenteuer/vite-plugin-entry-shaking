<script setup lang="ts">
import { ref, provide, onMounted } from 'vue';
import { randomId } from '#utils';
import { DIALOG_CONTAINER_ID_VAR } from '@components/Dialog/useDialog';
import { TOASTER_CONTAINER_CLASS, TOASTER_CONTAINER_ID_VAR } from '@components/Toast/useToaster';
import { FLOATING_CONTAINER_CLASS, FLOATING_CONTAINER_ID_VAR } from '@composables/useFloating';
import type { ThemeProps } from './theming';

const toasterContainerId = randomId('floating');
const floatingContainerId = randomId('floating');
const enableTeleports = ref(false);
provide(DIALOG_CONTAINER_ID_VAR, 'root');
provide(TOASTER_CONTAINER_ID_VAR, toasterContainerId);
provide(FLOATING_CONTAINER_ID_VAR, floatingContainerId);
provide('enableTeleports', enableTeleports);
provide('depth', 0);

onMounted(() => {
  enableTeleports.value = true;
});

defineProps<ThemeProps>();
</script>

<template>
  <div
    class="theme-wrapper"
    style="height: 100%"
    :data-color-scheme="colorScheme"
  >
    <div id="root">
      <slot name="story" />
    </div>
    <div
      :id="floatingContainerId"
      :class="FLOATING_CONTAINER_CLASS"
    />
    <div
      :id="toasterContainerId"
      :class="TOASTER_CONTAINER_CLASS"
    />
  </div>
</template>
