<script setup lang="ts">
import type { ShikijiTransformer } from 'shikiji';
import { ref, computed, watchEffect } from 'vue';
import { transformerNotationDiff } from 'shikiji-transformers';

import type { DiffsFileId } from '../../types';
import Dialog from './Dialog.vue';
import CodeBlock from './CodeBlock.vue';
import { useDiffs } from '../composables/useDiffs';

type DiffViewerProps = {
  /** Unique identifier for the file. */
  id: string;
  /** Original file content. */
  from: string;
  /** Updated file content. */
  to: string;
};

const props = withDefaults(defineProps<DiffViewerProps>(), {});
const dialog = ref<InstanceType<typeof Dialog> | null>(null);
const fileId = computed(() => props.id as DiffsFileId);
const diffs = useDiffs();
const code = ref('');

const transformers: ShikijiTransformer[] = [transformerNotationDiff()];

watchEffect(async () => {
  await diffs.prepare();
  const val = await diffs.compare(fileId.value, props.from, props.to);
  code.value = val as string;
});

defineExpose({ dialog });
</script>

<template>
  <Dialog
    ref="dialog"
    title="Transform diffs"
    :wide="true"
  >
    <CodeBlock
      :source="code"
      :transformers="transformers"
    />
  </Dialog>
</template>
