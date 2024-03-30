<script setup lang="ts">
import { computed } from 'vue';
import { store } from '#store';
import Status from '@components/Status/Status.vue';

const name = 'vite server';
const status = computed(() => {
  switch (store.status) {
    case 'connected':
      return { status: 'ok' as const, message: `Connected to ${name}` };
    case 'disconnected':
      return { status: 'error' as const, message: `Disconnected from ${name}` };
    case 'connecting':
      return { status: 'loading' as const, message: `Connecting to ${name}…` };
    default:
      return { status: 'warning' as const, message: 'Something is odd' };
  }
});
</script>

<template>
  <Status
    :status="status.status"
    :message="status.message"
  />
</template>
