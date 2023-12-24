<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

import type { Transform } from 'vite-plugin-entry-shaking';
import type { Column } from '@views/ScrollableView.vue';

export type TransformProps = {
  /** Transform message content. */
  content: Transform['content'];
  /** Transform level. */
  level: Transform['level'];
  /** Transform time. */
  timestamp?: Transform['timestamp'];
  /** Columns. */
  columns: Column[];
};

const props = defineProps<TransformProps>();

const gridTemplateColumns = computed(() => props.columns.map((column) => column.width).join(' '));

const transformIcon = computed(() => {
  switch (props.level) {
    case 'info':
      return 'info-circle';
    case 'warn':
      return 'alert-triangle';
    case 'error':
      return 'alert-circle';
    default:
      return 'info-circle';
  }
});

const transformClass = computed(() => ['transform', props.level]);
</script>

<template>
  <div :class="transformClass">
    <div class="transform__level"><Icon :icon="`tabler:${transformIcon}`" /></div>
    <div class="transform__time">{{ new Date(timestamp ?? 0).toLocaleTimeString() }}</div>
    <div class="transform__content">{{ content }}</div>
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

  &::before {
    content: '';
    position: absolute;
    width: 3px;
    height: 100%;
    background-color: var(--overall-border-color);
    left: 0;
    top: 0;
  }

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

  &__level {
    font-size: var(--font-size-lg);
    text-align: center;
    min-width: 1.325rem;
    margin-inline: calc(var(--spacing-md) + 3px) var(--spacing-md);
    position: relative;
  }

  &__time {
    font-family: monospace;
    font-size: var(--font-size-xs);
    text-align: center;
  }
}
</style>
