<script setup lang="ts">
import type { ImportParams } from 'vite-plugin-entry-shaking/src/types';
import Icon from '@component/Icon.vue';
import { useClassNames } from '@composable/useClassNames';

import type { GridRowProps } from '@views/GridView.vue';

export type TransformProps = GridRowProps<ImportParams & { name: string }>;

const $class = useClassNames('entry-export');
const props = defineProps<TransformProps>();
</script>

<template>
  <div :class="$class('flags')">
    <Icon
      v-if="item.importDefault"
      name="comet"
      :tooltip="item.importDefault ? 'Imported via source module\'s default export' : undefined"
    />
    <Icon
      v-if="item.selfDefined"
      name="code-dots"
      :tooltip="item.selfDefined ? 'Code defined within the entry' : undefined"
    />
  </div>
  <div :class="$class('alias')">{{ item.alias }}</div>
  <div :class="$class('name')">{{ item.name }}</div>
  <div :class="$class('originalName')">{{ item.originalName }}</div>
  <div :class="$class('path')">{{ item.path }}</div>
</template>
