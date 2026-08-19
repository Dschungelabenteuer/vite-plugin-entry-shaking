<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';
import { useMonacoDiffs } from './useMonacoDiffs';
import CodeBlock from '@components/CodeBlock/CodeBlock.vue';
import type { CodeBlockDiffsSimpleProps } from '../CodeBlockDiffs.types';
import { useClassNames } from '@composables/useClassNames';

const props = defineProps<CodeBlockDiffsSimpleProps>();
const $class = useClassNames('code-block-diffs-simple');
const toRef = useTemplateRef<InstanceType<typeof CodeBlock>>('toRef');
const fromRef = useTemplateRef<InstanceType<typeof CodeBlock>>('fromRef');
const { handleChange } = useMonacoDiffs(toRef, fromRef);

watch(
  () => [props.from, props.to] as const,
  ([from, to]) => handleChange(from, to),
  { immediate: true }
);
</script>

<template>
  <div :class="$class()">
    <CodeBlock
      ref="toRef"
      :content="to"
      language="javascript"
      :line-wrap="lineWrap"
    />
    <CodeBlock
      v-show="false"
      ref="fromRef"
      :content="from"
      language="javascript"
      :line-wrap="lineWrap"
    />
  </div>
</template>

<style>
.code-block-diffs-simple {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
