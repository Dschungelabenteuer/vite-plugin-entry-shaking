<script setup lang="ts">
import { inject } from 'vue';
import { BaseLayout } from '@shared/lib';
import type { ChannelStore } from '@shared/lib';

const store = inject<ChannelStore>('store')!;
</script>

<template>
  <BaseLayout :store="store">
    <router-view />
  </BaseLayout>
</template>
