<script setup lang="ts">
import { computed, provide, reactive } from 'vue';
import { useMediaQuery } from '@vueuse/core';

import type { EntryData } from 'vite-plugin-entry-shaking';
import Icon from '@component/Icon.vue';
import { useClassNames } from '@composable/useClassNames';
import type { VerticalTab } from '@views/VerticalTabsView.vue';
import VerticalTabsView from '@views/VerticalTabsView.vue';
import EntryMetrics from './details/EntryMetrics.vue';
import EntryDiffs from './details/EntryDiffs.vue';
import EntryExports from './details/EntryExports.vue';
import EntryWildcards from './details/EntryWildcards.vue';

export type EntryDetailsProps = {
  /** Entry path. */
  path?: string;
  /** Entry data. */
  entry?: EntryData;
};

type EntryDetailsEvents = {
  /** Emitted when the end of the tab list is reached. */
  'end-reached': [];
};

const $class = useClassNames('entry-details');
const emit = defineEmits<EntryDetailsEvents>();
const props = defineProps<EntryDetailsProps>();
const iconOnly = useMediaQuery('(max-width: 600px)');
provide('entry-details', reactive(props));

const tabs = computed<VerticalTab[]>(() => [
  {
    id: 'metrics',
    label: 'Metrics',
    icon: 'target-arrow',
    component: EntryMetrics,
  },
  {
    id: 'diffs',
    label: 'Diffs',
    icon: 'file-diff',
    component: EntryDiffs,
  },
  {
    id: 'exports',
    label: 'Exports',
    icon: 'package-export',
    count: props.entry?.exports.size,
    component: EntryExports,
  },
  {
    id: 'wildcards',
    label: 'Wildcards',
    icon: 'asterisk',
    count:
      (props.entry?.wildcardExports?.direct.length ?? 0) +
      (props.entry?.wildcardExports?.named.size ?? 0),
    component: EntryWildcards,
  },
]);
</script>

<template>
  <div :class="$class()">
    <div :class="$class('path')">
      <Icon name="file" />
      {{ path }}
    </div>
    <VerticalTabsView
      id="entry-details"
      label="Entry details"
      width="200px"
      min-content-width="400px"
      :icon-only="iconOnly"
      :tabs="tabs"
    />
  </div>
</template>

<style lang="scss">
.entry-details {
  height: calc(100% + (var(--spacing-lg) * 2));
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 2.5rem 1fr;
  margin: calc((var(--spacing-lg) * -1));
  overflow: hidden;

  &__path {
    @include border-bottom;
    @include padding(var(--spacing-md));
    font-family: monospace;
    display: flex;
    align-items: center;

    svg {
      margin-inline-end: var(--spacing-md);
    }
  }
}
</style>
