<script setup lang="ts">
import { inject } from 'vue';
import DiffViewer from '@component/DiffViewer.vue';
import { useClassNames } from '@composable/useClassNames';
import type { EntryDetailsProps } from '../EntryDetails.vue';

const $class = useClassNames('entry-diffs');
const entryDetails = inject<EntryDetailsProps>('entry-details')!;
</script>

<template>
  <DiffViewer
    :id="entryDetails.path ?? ''"
    :class="$class()"
    :from="entryDetails.entry?.source ?? ''"
    :to="entryDetails.entry?.updatedSource ?? ''"
  />
</template>

<style>
.entry-diffs {
  margin: var(--spacing-lg);
}
</style>
