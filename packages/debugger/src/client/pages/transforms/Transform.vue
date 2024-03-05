<script setup lang="ts">
import type { TransformData } from 'vite-plugin-entry-shaking';
import Button from '@component/Button.vue';
import { useClassNames } from '@composable/useClassNames';
import type { GridRowProps } from '@views/GridView.vue';

export type TransformProps = GridRowProps<TransformData>;

const $class = useClassNames('transform');
const props = defineProps<TransformProps>();
</script>

<template>
  <div :class="$class('access')">
    <Button
      label="Transform details"
      icon="eye"
      :icon-only="true"
      :disable-tooltip="true"
    />
  </div>
  <div :class="$class('time')">{{ new Date(item.timestamp ?? 0).toLocaleTimeString() }}</div>
  <div :class="$class('duration')">{{ item.time }}ms</div>
  <div :class="$class('path')">{{ item.id }}</div>
</template>

<style lang="scss">
.transform {
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
    /* backdrop-filter: blur(3px); // perf issue */

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

  &__path {
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--font-size-sm);
    padding-inline: var(--spacing-lg);
  }
}
</style>
