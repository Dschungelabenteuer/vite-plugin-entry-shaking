<script setup lang="ts">
import { inject } from 'vue';
import DiffViewer from '@component/DiffViewer.vue';
import { useClassNames } from '@composable/useClassNames';
import type { TransformDetailsProps } from '../TransformDetails.vue';

const $class = useClassNames('transform-diffs');
const transformDetails = inject<TransformDetailsProps>('transform-details')!;
</script>

<template>
  <DiffViewer
    :id="transformDetails.path ?? ''"
    :class="$class()"
    :from="transformDetails.transform?.source ?? ''"
    :to="transformDetails.transform?.transformed ?? ''"
  />
</template>

<style>
.transform-diffs {
  margin: var(--spacing-lg);
}
</style>
