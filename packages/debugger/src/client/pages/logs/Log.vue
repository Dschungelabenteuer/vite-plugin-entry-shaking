<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

import type { Log } from 'vite-plugin-entry-shaking';
import { useClassNames } from '@composable/useClassNames';
import type { GridRowProps } from '@views/GridView.vue';

export type LogProps = GridRowProps<{
  /** Log message content. */
  content: Log['content'];
  /** Log level. */
  level: Log['level'];
  /** Log time. */
  timestamp?: Log['timestamp'];
}>;

const $class = useClassNames('log');
const props = defineProps<LogProps>();

const logIcon = computed(() => {
  switch (props.item.level) {
    case 'success':
      return 'circle-check';
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
</script>

<template>
  <div :class="$class('level')"><Icon :icon="`tabler:${logIcon}`" /></div>
  <div :class="$class('time')">{{ new Date(item.timestamp ?? 0).toLocaleTimeString() }}</div>
  <div :class="$class('content')">{{ item.content }}</div>
</template>

<style lang="scss">
.log {
  &::before {
    content: '';
    pointer-events: none;
    position: absolute;
    width: 3px;
    height: 100%;
    background-color: var(--overall-border-color);
    left: 0;
    top: 0;
  }

  &::after {
    content: '';
    pointer-events: none;
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
  @include log-status-color(success, true);
  @include log-status-color(warn, true);
  @include log-status-color(error, true, true);

  &__level {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
    text-align: center;
    height: 2.5rem;
    width: 2.5rem;
    margin-inline: var(--spacing-sm);
    position: relative;
  }

  &__time {
    font-family: monospace;
    font-size: var(--font-size-xs);
    text-align: center;
  }
}
</style>
