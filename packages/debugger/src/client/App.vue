<script setup lang="ts">
import { provide } from 'vue';
import Base from './layout/Base.vue';

provide('depth', 0);
</script>

<template>
  <Base>
    <router-view />
  </Base>
</template>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
