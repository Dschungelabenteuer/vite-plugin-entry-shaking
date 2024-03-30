<script setup lang="ts">
import { useClassNames } from '@composables/useClassNames';
import type { WildcardProps } from '../Entries.types';

const $class = useClassNames('entry-wildcard');
const props = defineProps<WildcardProps>();
</script>

<template>
  <div :class="$class('name')">{{ item.name }}</div>
  <div :class="$class('path')">{{ item.path }}</div>
</template>
