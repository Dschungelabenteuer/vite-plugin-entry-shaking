<script setup lang="ts">
import { computed } from 'vue';
import { formatDuration } from '#utils';
import Button from '@components/Button/Button.vue';
import { useClassNames } from '@composables/useClassNames';
import type { TransformEvents, TransformProps } from './Transform.types';

const $class = useClassNames('transform');
const emit = defineEmits<TransformEvents>();
const props = defineProps<TransformProps>();
const time = computed(() => formatDuration(props.item.time));
</script>

<template>
  <div :class="$class('access')">
    <Button
      label="Transform details"
      icon="eye"
      :icon-only="true"
      :tooltip-options="{ disabled: true }"
      @click="emit('view', item.absolutePath)"
    />
  </div>
  <div :class="$class('time')">{{ new Date(item.timestamp ?? 0).toLocaleTimeString() }}</div>
  <div :class="$class('duration')">{{ time }}</div>
  <div :class="$class('path')">{{ item.relativePath }}</div>
</template>

<style lang="scss">
.transform {
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    content: '';
    background: transparent;
    opacity: 0.16;
  }

  &__access {
    position: sticky;
    left: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;

    /* backdrop-filter: blur(3px); // perf issue */

    &::before {
      position: absolute;
      top: -3px;
      left: 0;
      z-index: -1;
      width: 100%;
      height: calc(100% + 3px);
      content: '';
      background: var(--entry-fixed-action-background-tint);
      background-attachment: fixed;
      background-position: left center;
      background-size: 100vw 100vh;
      box-shadow: 1px 0 0 0 var(--grid-header-border-color);
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
    padding-inline: var(--spacing-lg);
    overflow: hidden;
    font-family: monospace;
    font-size: var(--font-size-sm);
    text-overflow: ellipsis;
  }
}
</style>
