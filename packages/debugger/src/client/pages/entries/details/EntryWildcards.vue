<script setup lang="ts">
import { inject } from 'vue';
import type { EntryDetailsProps } from '../EntryDetails.vue';

const entryDetails = inject<EntryDetailsProps>('entry-details')!;
</script>

<template>
  {{ entryDetails.entry?.wildcardExports }}
  <div>hello entry wildcards</div>
</template>
