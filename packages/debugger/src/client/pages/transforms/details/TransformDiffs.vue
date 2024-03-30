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
    :source="transformDetails.transform?.source ?? ''"
    :target="transformDetails.transform?.transformed ?? ''"
  />
</template>

<style>
.transform-diffs {
  margin: var(--spacing-lg);
}
</style>
