<script setup lang="ts">
import { inject } from 'vue';

import CodeBlock from '@components/CodeBlock/CodeBlock.vue';
import { useClassNames } from '@composables/useClassNames';
import type { EntryDetailsProps } from '../Entries.types';

const $class = useClassNames('entry-diffs');
const entryDetails = inject<EntryDetailsProps>('entry-details')!;
</script>

<template>
  <CodeBlock
    :id="entryDetails.path ?? ''"
    :class="$class()"
    :source="entryDetails.entry?.source ?? ''"
    :target="entryDetails.entry?.updatedSource ?? ''"
  />
</template>

<style>
.entry-diffs {
  margin: var(--spacing-lg);
}
</style>
