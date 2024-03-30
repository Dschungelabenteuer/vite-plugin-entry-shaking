<script setup lang="ts">
import { provide } from 'vue';
import { DIALOG_CONTAINER_ID_VAR, DIALOG_MAIN_CONTAINER_ID } from '@components/Dialog/useDialog';
import { TOASTER_CONTAINER_ID_VAR, TOASTER_MAIN_CONTAINER_ID } from '@components/Toast/useToaster';
import { FLOATING_CONTAINER_ID_VAR, FLOATING_MAIN_CONTAINER_ID } from '@composables/useFloating';
import Base from './layout/Base/Base.vue';

provide(FLOATING_CONTAINER_ID_VAR, FLOATING_MAIN_CONTAINER_ID);
provide(TOASTER_CONTAINER_ID_VAR, TOASTER_MAIN_CONTAINER_ID);
provide(DIALOG_CONTAINER_ID_VAR, DIALOG_MAIN_CONTAINER_ID);
provide('depth', 0);
</script>

<template>
  <Base>
    <router-view />
  </Base>
</template>
