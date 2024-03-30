<script setup lang="ts">
import { inject } from 'vue';
import Toast from '@components/Toast/Toast.vue';
import type { Toaster } from './Toast.types';

const $toaster = inject<Toaster>('$toaster')!;
</script>

<template>
  <div :class="$toaster.class.value">
    <TransitionGroup name="toaster">
      <Toast
        v-for="toast in $toaster.toasts.value"
        :key="toast.idx"
        v-bind="toast"
      >
        {{ toast.message }}
      </Toast>
    </TransitionGroup>
  </div>
</template>
