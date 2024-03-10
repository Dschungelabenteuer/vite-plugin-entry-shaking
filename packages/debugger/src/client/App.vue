<script setup lang="ts">
import { provide } from 'vue';
import { FLOATING_MAIN_CONTAINER_ID, FLOATING_CONTAINER_ID_VAR } from '@composable/useFloating';
import Base from './layout/Base.vue';

provide(FLOATING_CONTAINER_ID_VAR, FLOATING_MAIN_CONTAINER_ID);
provide('depth', 0);
</script>

<template>
  <Base>
    <router-view />
  </Base>
</template>
