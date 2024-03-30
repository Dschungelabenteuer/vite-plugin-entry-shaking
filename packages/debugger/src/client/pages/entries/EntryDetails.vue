<script setup lang="ts">
import { computed, provide, reactive } from 'vue';
import { useRoute } from 'vue-router';

import type { VerticalTab } from '@views/VerticalTabs/VerticalTabs.types';
import Details from '@views/Details/Details.vue';
import type { EntryDetailsEvents, EntryDetailsProps } from './Entries.types';
import EntryMetrics from './details/EntryMetrics.vue';
import EntryDiffs from './details/EntryDiffs.vue';
import EntryExports from './details/EntryExports.vue';
import EntryWildcards from './details/EntryWildcards.vue';
import EntryDiagnostics from './details/EntryDiagnostics.vue';

const route = useRoute();
const emit = defineEmits<EntryDetailsEvents>();
const props = defineProps<EntryDetailsProps>();
const tabs = computed<VerticalTab[]>(() => {
  const list = [
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
  ];

  const diagnosticsCount = props.entry?.diagnostics.size;
  if (diagnosticsCount) {
    list.push({
      id: 'diagnostics',
      label: 'Diagnostis',
      icon: 'alert-triangle',
      count: diagnosticsCount,
      component: EntryDiagnostics,
    });
  }

  return list;
});

const activeTabId = computed(() => (route.params.tab as string) ?? 'metrics');

provide('entry-details', reactive(props));
provide('depth', 1);
</script>

<template>
  <Details
    id="entry-details"
    :active-tab-id="activeTabId"
    :absolute-path
    :relative-path
    :tabs
    tabs-label="Entry details"
    tabs-width="200px"
    tabs-min-content-width="400px"
  />
</template>
