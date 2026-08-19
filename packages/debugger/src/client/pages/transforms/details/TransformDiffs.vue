<script setup lang="ts">
import { inject } from 'vue';
import Codeblock from '@components/CodeBlock/CodeBlock.vue';
import { useClassNames } from '@composables/useClassNames';
import type { TransformDetailsProps } from '../Transform.types';

const $class = useClassNames('transform-diffs');
const transformDetails = inject<TransformDetailsProps>('transform-details')!;
</script>

<template>
  <Codeblock
    :id="transformDetails.absolutePath ?? ''"
    :class="$class()"
    :from="transformDetails.transform?.source ?? ''"
    :to="transformDetails.transform?.transformed ?? ''"
    :diff="true"
    :one-column="true"
    :line-wrap="false"
    :diff-panel-size="100"
  />
</template>

<style scoped>
.transform-diffs {
  padding: var(--spacing-md);
  padding-inline-start: calc(var(--spacing-md) + 1px);
}
</style>
