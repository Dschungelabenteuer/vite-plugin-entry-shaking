<script setup lang="ts">
import { ref, provide, onMounted } from 'vue';
import { randomId } from '#utils';
import type { ThemeProps } from './theming';

const floatingContainerId = randomId('floating');
const enableTeleports = ref(false);
provide('floatingContainerId', floatingContainerId);
provide('enableTeleports', enableTeleports);

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
      class="floating-container"
    />
  </div>
</template>
