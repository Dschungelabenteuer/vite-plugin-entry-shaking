<script setup lang="ts">
import { inject } from 'vue';
import type { EntryDetailsProps } from '../EntryDetails.vue';

const entryDetails = inject<EntryDetailsProps>('entry-details')!;
</script>

<template>
  time: {{ entryDetails.entry?.time }}ms self: {{ entryDetails.entry?.self }}ms
  <div>hello entry metrics</div>
</template>
