<script setup lang="ts">
import { computed, inject } from 'vue';

import { useBrowserData } from '@composable/useBrowserData';
import { useClassNames } from '@composable/useClassNames';
import BrowserView from '@views/BrowserView.vue';
import ScrollableView from '@views/ScrollableView.vue';
import type { EntryDetailsProps } from '../EntryDetails.vue';

const $class = useClassNames('entry-exports');
const entryDetails = inject<EntryDetailsProps>('entry-details')!;
const source = computed(() =>
  [...(entryDetails.entry?.exports.entries() ?? new Map())].map(([name, exp]) => ({
    ...exp,
    name,
  })),
);

const { sort, columns, items, filters, matched, methods } = useBrowserData({
  source,
  filters: () => true,
  columns: {
    icon: {
      label: '',
      width: '2.5rem',
      minWidth: '100px',
    },
    time: {
      label: 'Time (total)',
      class: 'centered',
      width: '8.5rem',
      minWidth: '100px',
      sortable: true,
      ascLabel: 'Show slowest first',
      descLabel: 'Show fastest first',
    },
    self: {
      label: 'Time (self)',
      class: 'centered',
      width: '8.5rem',
      minWidth: '100px',
      sortable: true,
      ascLabel: 'Show slowest first',
      descLabel: 'Show fastest first',
    },
    id: {
      label: 'File',
      width: '1fr',
      searchable: true,
    },
  },
});

const total = computed(() => entryDetails.entry?.exports.size);
const page = computed(() => ({ name: 'Exports' }));
</script>

<template>
  <BrowserView
    :class="$class()"
    v-bind="page"
    :total="total"
    :matched="matched"
    :condensed="true"
    @search="methods.onSearch"
  >
    <template #filters> </template>

    <ScrollableView
      v-bind="{ columns, items, minItemSize: 48, sort }"
      :condensed="true"
      @sort="methods.onSortChange"
    >
      <template #default="{ item, index }">
        {{ item }}
      </template>
    </ScrollableView>
  </BrowserView>
</template>

<style lang="scss">
@include color-scheme(light) {
  --entry-exports-scrollable-header-background-tint: transparent;
}

@include color-scheme(dark) {
  --entry-exports-scrollable-header-background-tint: #1c151b;
}

.entry-exports {
  --scrollable-header-background-tint: var(--entry-exports-scrollable-header-background-tint);
}
</style>
