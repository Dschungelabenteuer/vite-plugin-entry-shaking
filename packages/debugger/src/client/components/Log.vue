<script setup lang="ts">
import type { LogLevel } from 'vite';
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

type LogProps = {
  content: string;
  level: LogLevel;
  faded?: boolean;
};

const props = defineProps<LogProps>();

const logIcon = computed(() => {
  switch (props.level) {
    case 'info':
      return 'tabler:info-circle';
    case 'warn':
      return 'tabler:alert-triangle';
    case 'error':
      return 'tabler:alert-circle';
    default:
      return 'tabler:info-circle';
  }
});

const logClass = computed(() => ['log', props.level, props.faded ? 'faded' : '']);
</script>

<template>
  <div :class="logClass">
    <div class="log__level"><Icon :icon="logIcon" /></div>
    <div class="log__content">{{ content }}</div>
  </div>
</template>

<style lang="scss">
@import '../styles/mixins';

.log {
  display: flex;
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
    background-color: transparent;
    left: 0;
    top: 0;
  }

  &.info {
    &::before {
      background-color: var(--status-color-info);
    }

    .log__level {
      color: var(--status-color-info);
    }
  }

  &.warning {
    &::before {
      background-color: var(--status-color-warning);
    }

    .log__level {
      color: var(--status-color-warning);
    }
  }

  &.success {
    &::before {
      background-color: var(--status-color-success);
    }

    .log__level {
      color: var(--status-color-success);
    }
  }

  &.error {
    &::before {
      background-color: var(--status-color-error);
    }

    .log__level {
      color: var(--status-color-error);
    }
  }

  &__level {
    font-size: var(--font-size-lg);
    text-align: center;
    min-width: 1.325rem;
    margin-inline: calc(var(--spacing-md) + 3px) var(--spacing-md);
    position: relative;
  }
}
</style>
