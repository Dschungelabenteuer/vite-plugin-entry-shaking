<script setup lang="ts">
import { computed } from 'vue';
import Icon from '@components/Icon/Icon.vue';
import { useClassNames } from '@composables/useClassNames';
import type { TransformProps } from '../Entries.types';

const $class = useClassNames('entry-export');
const props = defineProps<TransformProps>();

const importDefaultTooltip = computed(() =>
  props.item.importDefault ? "Imported via source module's default export" : undefined,
);

const selfDefinedTooltip = computed(() =>
  props.item.selfDefined ? 'Code defined within the entry' : undefined,
);
</script>

<template>
  <div :class="$class('flags')">
    <Icon
      v-if="item.importDefault"
      :tooltip="importDefaultTooltip"
      name="comet"
    />
    <Icon
      v-if="item.selfDefined"
      :tooltip="selfDefinedTooltip"
      name="code-dots"
    />
  </div>
  <div :class="$class('alias')">{{ item.alias }}</div>
  <div :class="$class('name')">{{ item.name }}</div>
  <div :class="$class('originalName')">{{ item.originalName }}</div>
  <div :class="$class('path')">{{ item.path }}</div>
</template>
