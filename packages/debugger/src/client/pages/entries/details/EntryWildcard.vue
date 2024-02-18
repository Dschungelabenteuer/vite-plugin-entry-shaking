<script setup lang="ts">
import { useClassNames } from '@composable/useClassNames';

import type { GridRowProps } from '@views/GridView.vue';

export type TransformProps = GridRowProps<{
  name: string;
  path: string;
}>;

const $class = useClassNames('entry-wildcard');
const props = defineProps<TransformProps>();
</script>

<template>
  <div :class="$class('name')">{{ item.name }}</div>
  <div :class="$class('path')">{{ item.path }}</div>
</template>
