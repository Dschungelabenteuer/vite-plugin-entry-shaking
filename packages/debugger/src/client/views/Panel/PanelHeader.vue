<script setup lang="ts">
import { inject } from 'vue';

import Button from '@components/Button/Button.vue';
import type { ClassNameFn } from '@composables/useClassNames';
import type { PanelHeaderProps } from './Panel.types';

const $class = inject<ClassNameFn>('$class')!;
const props = defineProps<PanelHeaderProps>();
</script>

<template>
  <header :class="$class('header')">
    <Button
      v-if="isOpen"
      ref="closeBtnRef"
      class="size"
      :aria-controls="panelId"
      :aria-expanded="true"
      icon="arrow-bar-right"
      :icon-only="true"
      :label="closePanelLabel"
      @click="toggle"
    />
    <h2>Metrics</h2>
  </header>
</template>

<style lang="scss">
.panel {
  &__header {
    display: flex;
    align-items: center;
    padding-block: 1.5px;
    box-shadow: 0 0 0 1px var(--overall-border-color);

    h2 {
      width: 100%;
      padding-inline-start: var(--spacing-md);
      font-size: 1.14rem;
    }
  }
}
</style>
