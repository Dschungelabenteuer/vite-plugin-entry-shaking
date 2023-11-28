<script setup lang="ts">
import { inject } from 'vue';
import BaseLayout from './layouts/BaseLayout.vue';
import type { ChannelStore } from './channel';

const store = inject<ChannelStore>('store')!;

</script>

<template>
  <BaseLayout :store="store">
    <router-view />
  </BaseLayout>
</template>
