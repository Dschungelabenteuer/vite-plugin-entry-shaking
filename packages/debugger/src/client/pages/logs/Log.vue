<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

import type { Log } from 'vite-plugin-entry-shaking';
import type { Column } from '@views/GridView.vue';

export type LogProps = {
  /** Log message content. */
  content: Log['content'];
  /** Log level. */
  level: Log['level'];
  /** Log time. */
  timestamp?: Log['timestamp'];
  /** Columns. */
  columns: Column[];
};

const props = defineProps<LogProps>();

const logIcon = computed(() => {
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

const gridTemplateColumns = computed(() => props.columns.map((column) => column.width).join(' '));
const logClass = computed(() => ['log', props.level]);
</script>

<template>
  <div :class="logClass">
    <div class="log__level"><Icon :icon="`tabler:${logIcon}`" /></div>
    <div class="log__time">{{ new Date(timestamp ?? 0).toLocaleTimeString() }}</div>
    <div class="log__content">{{ content }}</div>
  </div>
</template>

<style lang="scss">
.log {
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

  &.debug {
    opacity: 0.7;
  }

  @mixin log-status-color($status, $emphasize: false, $color-text: false) {
    &.#{$status} {
      @if $color-text {
        color: var(--status-color-#{$status});
      } @else {
        .log__level {
          color: var(--status-color-#{$status});
        }
      }

      &::before {
        background-color: var(--status-color-#{$status});
      }

      @if $emphasize {
        font-weight: 600;

        &::after {
          background: linear-gradient(
            60deg,
            var(--status-color-#{$status}) -20%,
            rgba(0, 0, 0, 0) 20%
          );
        }
      }
    }
  }

  @include log-status-color(info);
  @include log-status-color(success);
  @include log-status-color(warn, true);
  @include log-status-color(error, true, true);

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
