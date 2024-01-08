<script setup lang="ts">
import { computed } from 'vue';

import type { TransformData } from 'vite-plugin-entry-shaking';
import Button from '@component/Button.vue';
import type { Column } from '@views/GridView.vue';

export type TransformProps = TransformData & {
  /** Columns. */
  columns: Column[];
};

const props = defineProps<TransformProps>();

const gridTemplateColumns = computed(() => props.columns.map((column) => column.width).join(' '));
const transformClass = computed(() => ['transform']);
</script>

<template>
  <div :class="transformClass">
    <div class="transform__access">
      <Button
        label="Transform details"
        icon="eye"
        :icon-only="true"
        :disable-tooltip="true"
      />
    </div>
    <div class="transform__time">{{ new Date(timestamp ?? 0).toLocaleTimeString() }}</div>
    <div class="transform__duration">{{ time }}ms</div>
    <div class="transform__content">{{ id }}</div>
  </div>
</template>

<style lang="scss">
.transform {
  display: grid;
  grid-template-columns: v-bind(gridTemplateColumns);
  align-items: center;
  height: 2.75rem;
  padding-block: var(--spacing-sm);
  white-space: nowrap;
  @include border-bottom;

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: transparent;
    left: 0;
    top: 0;
    opacity: 0.16;
  }

  &__access {
    z-index: 10;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    position: sticky;
    left: 0;
    backdrop-filter: blur(3px);

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: calc(100% + 3px);
      background: var(--entry-fixed-action-background-tint);
      background-position: left center;
      background-attachment: fixed;
      background-size: 100vw 100vh;
      box-shadow: 1px 0 0 0 var(--grid-header-border-color);
      left: 0;
      top: -3px;
      z-index: -1;
      opacity: 0.82;
    }

    button {
      font-size: var(--font-size-md);
    }
  }

  &__time,
  &__duration {
    font-family: monospace;
    font-size: var(--font-size-xs);
    text-align: center;
  }
}
</style>
