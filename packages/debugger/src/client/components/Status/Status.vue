<script setup lang="ts">
import { computed } from 'vue';
import Icon from '@components/Icon/Icon.vue';
import { useClassNames } from '@composables/useClassNames';
import type { StatusProps } from './Status.types';

const $class = useClassNames('status');
const props = defineProps<StatusProps>();
const classes = computed(() => [$class(), props.status]);
const icon = computed(() => {
  switch (props.status) {
    case 'ok':
      return 'circle-check';
    case 'error':
      return 'circle-x';
    case 'loading':
      return 'refresh';
    case 'warning':
      return 'alert-triangle';
    default:
      return 'exclamation-circle';
  }
});
</script>

<template>
  <div :class="classes">
    <Icon :name="icon" />
    {{ message }}
  </div>
</template>

<style lang="scss">
.status {
  @include flex;

  svg {
    margin-inline: var(--spacing-md);
  }

  &.ok {
    color: var(--status-color-success);
  }

  &.error {
    color: var(--status-color-error);
  }

  &.loading {
    svg {
      animation: spin 800ms infinite linear;

      @media (prefers-reduced-motion: reduce) {
        animation: spin 6s infinite linear;
      }
    }
  }
}
</style>
