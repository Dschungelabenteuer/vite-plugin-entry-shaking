<script setup lang="ts">
import { inject } from 'vue';

import type { EntryDetailsProps } from '../Entries.types';

const entryDetails = inject<EntryDetailsProps>('entry-details')!;
</script>

<template>
  <div>
    time: {{ entryDetails.entry?.time }}ms self: {{ entryDetails.entry?.self }}ms
    <div>hello entry metrics</div>
  </div>
</template>
