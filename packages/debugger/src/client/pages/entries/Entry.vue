<script setup lang="ts">
import { computed } from 'vue';

import type { EntryData } from 'vite-plugin-entry-shaking';
import { useClassNames } from '@composable/useClassNames';
import Button from '@component/Button.vue';
import type { Column } from '@views/ScrollableView.vue';

export type EntryProps = EntryData & {
  /** Entry file path. */
  path: string;
  /** Columns. */
  columns: Column[];
};

const $class = useClassNames('entry');
const emit = defineEmits<{ view: [path: string] }>();
const props = defineProps<EntryProps>();

const gridTemplateColumns = computed(() => props.columns.map((column) => column.width).join(' '));
</script>

<template>
  <div :class="$class()">
    <div :class="$class('access')">
      <Button
        label="Details"
        icon="eye"
        :icon-only="true"
        :disable-tooltip="true"
        @click="emit('view', path)"
      />
    </div>
    <div :class="$class('time')">{{ time }}ms</div>
    <div :class="$class('self')">{{ time }}ms</div>
    <div :class="$class('path')">
      <span>{{ path }}</span>
    </div>
  </div>
</template>

<style lang="scss">
@include color-scheme(light) {
  --entry-fixed-action-background-tint: transparent;
}

@include color-scheme(dark) {
  --entry-fixed-action-background-tint: var(--background-gradient);
}

.entry {
  display: grid;
  grid-template-columns: v-bind(gridTemplateColumns);
  align-items: center;
  height: 2.75rem;
  padding-block: var(--spacing-sm);
  white-space: nowrap;
  @include border-bottom;

  &__access {
    z-index: 10;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    position: sticky;
    left: 0;
    backdrop-filter: blur(3px);

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: calc(100% + 3px);
      background: var(--entry-fixed-action-background-tint);
      background-position: left center;
      background-attachment: fixed;
      background-size: 100vw 100vh;
      box-shadow: 1px 0 0 0 var(--scrollable-header-border-color);
      left: 0;
      top: -3px;
      z-index: -1;
      opacity: 0.82;
    }

    button {
      font-size: var(--font-size-md);
    }
  }

  &__path {
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--font-size-sm);
    padding-inline: var(--spacing-lg);
    span {
      direction: ltr;
    }
  }

  &__time,
  &__self {
    font-family: monospace;
    font-size: var(--font-size-xs);
    text-align: center;
  }
}
</style>
