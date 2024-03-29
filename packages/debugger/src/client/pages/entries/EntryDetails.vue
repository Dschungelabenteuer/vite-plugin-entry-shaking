<script setup lang="ts">
import { computed, provide, reactive } from 'vue';

import type { VerticalTab } from '@views/VerticalTabs/VerticalTabs.types';
import Details from '@views/Details/Details.vue';
import EntryMetrics from './details/EntryMetrics.vue';
import EntryDiffs from './details/EntryDiffs.vue';
import EntryExports from './details/EntryExports.vue';
import EntryWildcards from './details/EntryWildcards.vue';
import type { EntryDetailsEvents, EntryDetailsProps } from './Entries.types';

const emit = defineEmits<EntryDetailsEvents>();
const props = defineProps<EntryDetailsProps>();
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

provide('entry-details', reactive(props));
provide('depth', 1);
</script>

<template>
  <Details
    id="entry-details"
    :absolute-path="String(path)"
    :relative-path="String(path)"
    :tabs
    tabs-label="Entry details"
    tabs-width="200px"
    tabs-min-content-width="400px"
  />
</template>
