<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { store } from '../store';

const name = 'vite server';

const status = computed(() => {
  switch (store.status) {
    case 'connected':
      return { icon: 'circle-check', label: `Connected to ${name}` };
    case 'disconnected':
      return { icon: 'circle-x', label: `Disconnected from ${name}` };
    case 'connecting':
      return { icon: 'refresh', label: `Connecting to ${name}…` };
    default:
      return { icon: 'alert-triangle', label: 'Something is odd' };
  }
});
</script>

<template>
  <div :class="['vite-status', store.status]">
    <Icon :icon="`tabler:${status.icon}`" />
    {{ status.label }}
  </div>
</template>

<style lang="scss">
.vite-status {
  @include flex;

  svg {
    margin-inline: var(--spacing-md);
  }

  .connected {
    color: var(--status-color-success);
  }

  .disconnected {
    color: var(--status-color-error);
  }

  .connecting {
    svg {
      animation: spin 800ms infinite linear;
      @media (prefers-reduced-motion: reduce) {
        animation: spin 6s infinite linear;
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
