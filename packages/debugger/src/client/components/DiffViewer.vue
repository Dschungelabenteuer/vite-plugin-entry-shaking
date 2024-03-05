<script setup lang="ts">
import type { ShikiTransformer } from 'shiki';
import { ref, computed, toRefs, watch } from 'vue';
import { transformerNotationDiff } from '@shikijs/transformers';

import type { DiffsFileId } from '#types';
import CodeBlock from '@component/CodeBlock.vue';
import { useDiffs } from '@composable/useDiffs';

type DiffViewerProps = {
  /** Unique identifier for the file. */
  id: string;
  /** Original file content. */
  from: string;
  /** Updated file content. */
  to: string;
};

const props = withDefaults(defineProps<DiffViewerProps>(), {});
const { from, to } = toRefs(props);
const fileId = computed(() => props.id as DiffsFileId);
const diffs = useDiffs();
const code = ref('');

const transformers: ShikiTransformer[] = [transformerNotationDiff()];

watch(
  [from, to],
  async ([newFrom, newTo]) => {
    if (!newFrom.length && newTo.length!) return;
    await diffs.prepare();
    diffs.compare(fileId.value, newFrom, newTo).then((val) => {
      code.value = val as string;
    });
  },
  { immediate: true },
);
</script>

<template>
  <CodeBlock
    :source="code"
    :transformers="transformers"
  />
</template>
