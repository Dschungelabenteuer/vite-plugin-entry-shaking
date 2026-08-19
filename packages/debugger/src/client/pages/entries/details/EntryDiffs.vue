<script setup lang="ts">
import { inject } from 'vue';
import { useClassNames } from '@composables/useClassNames';
import CodeBlockDiffs from '@components/CodeBlockDiffs/CodeBlockDiffs.vue';
import type { EntryDetailsProps } from '../Entries.types';

const $class = useClassNames('entry-diffs');
const entryDetails = inject<EntryDetailsProps>('entry-details')!;
</script>

<template>
  <CodeBlockDiffs
    :id="entryDetails.relativePath ?? ''"
    :class="$class()"
    :from="entryDetails.entry?.source ?? ''"
    :to="entryDetails.entry?.updatedSource ?? ''"
    :mode="'simple'"
    :line-wrap="false"
  />
</template>

<style>
.entry-diffs {
  margin: var(--spacing-lg);
}
</style>
