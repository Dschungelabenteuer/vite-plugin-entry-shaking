<script setup lang="ts">
import { computed, inject } from 'vue';

import { useClassNames } from '@composables/useClassNames';
import { useBrowserData } from '@views/Browser/useBrowserData';
import BrowserView from '@views/Browser/Browser.vue';
import GridView from '@views/Grid/Grid.vue';
import type { EntryDetailsProps } from '../Entries.types';
import EntryWildcard from './EntryWildcard.vue';
import EntryWildcardsFilters from './EntryWildcardsFilters.vue';

const $class = useClassNames('entry-wildcards');
const entryDetails = inject<EntryDetailsProps>('entry-details')!;
const source = computed(() => {
  const wildcardExports = entryDetails.entry?.wildcardExports;
  const directExportsCount = wildcardExports?.direct.length ?? 0;
  return [
    ...(wildcardExports?.direct.map((path, id) => ({ name: '-', path, id })) ?? []),
    ...[...(wildcardExports?.named.entries() ?? [])].map(([name, path], index) => ({
      name,
      path,
      id: directExportsCount + index,
    })),
  ];
});

const defaultFilters: ('named' | 'direct')[] = ['named', 'direct'];
const { id, title, sort, columns, items, filters, matched, methods } = useBrowserData({
  id: 'entry-exports',
  title: 'List of exports',
  source,
  filterFn: (item, f) => {
    if (f.includes('named') && item.name !== '-') return true;
    if (f.includes('direct') && item.name === '-') return true;
    return false;
  },
  defaultFilters,
  columns: {
    name: {
      label: 'Name',
      class: 'centered',
      width: '8.5rem',
      minWidth: '100px',
      searchable: true,
    },
    path: {
      label: 'Path',
      width: '1fr',
      searchable: true,
    },
  },
});

const rowClass = 'entry';
const minItemSize = 48;
const total = computed(() => source.value.length);
const page = computed(() => ({ name: 'Wilcards' }));
</script>

<template>
  <BrowserView
    :class="$class()"
    page-icon="asterisk"
    v-bind="page"
    :total="total"
    :matched="matched"
    :condensed="true"
    @search="methods.onSearch"
  >
    <template #filters>
      <EntryWildcardsFilters v-model="filters" />
    </template>

    <GridView
      :id="id"
      :items="items"
      :title="title"
      :columns="columns"
      :sort="sort"
      :row-class="rowClass"
      :min-item-size="minItemSize"
      :condensed="true"
      @sort="methods.onSortChange"
    >
      <template #row="rowProps">
        <EntryWildcard
          :key="`wildcard-${rowProps.item.id}`"
          v-bind="rowProps"
        />
      </template>
    </GridView>
  </BrowserView>
</template>

<style lang="scss">
@include color-scheme(light) {
  --entry-wildcards-grid-header-background-tint: transparent;
}

@include color-scheme(dark) {
  --entry-wildcards-grid-header-background-tint: #1c151b;
}

.entry-wildcards {
  --grid-header-background-tint: var(--entry-wildcards-grid-header-background-tint);
}
</style>
