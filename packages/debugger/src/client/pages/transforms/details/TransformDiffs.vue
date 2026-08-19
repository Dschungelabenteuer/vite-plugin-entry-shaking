<script setup lang="ts">
import { inject } from 'vue';
import { useClassNames } from '@composables/useClassNames';
import CodeBlockDiffs from '@components/CodeBlockDiffs/CodeBlockDiffs.vue';
import type { TransformDetailsProps } from '../Transform.types';

const $class = useClassNames('transform-diffs');
const transformDetails = inject<TransformDetailsProps>('transform-details')!;
</script>

<template>
  <CodeBlockDiffs
    :id="transformDetails.absolutePath ?? ''"
    :class="$class()"
    :from="transformDetails.transform?.source ?? ''"
    :to="transformDetails.transform?.transformed ?? ''"
    :mode="'simple'"
    :line-wrap="false"
  />
</template>

<style scoped>
.transform-diffs {
  padding: var(--spacing-md);
  padding-inline-start: calc(var(--spacing-md) + 1px);
}
</style>
