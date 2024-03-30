<script setup lang="ts">
import { computed, inject } from 'vue';

import { useClassNames } from '@composables/useClassNames';
import { useBrowserData } from '@views/Browser/useBrowserData';
import BrowserView from '@views/Browser/Browser.vue';
import GridView from '@views/Grid/Grid.vue';
import type { EntryDetailsProps } from '../Entries.types';
import EntryExport from './EntryExport.vue';
import EntryExportsFilters from './EntryExportsFilters.vue';

const $class = useClassNames('entry-exports');
const entryDetails = inject<EntryDetailsProps>('entry-details')!;
const source = computed(() =>
  [...(entryDetails.entry?.exports.entries() ?? new Map())].map(([name, exp], index) => ({
    ...exp,
    name,
    id: name,
  })),
);

const defaultFilters: ('defaultImport' | 'selfDefined')[] = ['defaultImport', 'selfDefined'];
const { id, title, sort, columns, items, filters, matched, methods } = useBrowserData({
  id: 'entry-exports',
  title: 'List of exports',
  source,
  filterFn: (item, f) => {
    if (f.includes('defaultImport') && item.importDefault) return true;
    if (f.includes('selfDefined') && item.selfDefined) return true;
    return false;
  },
  defaultFilters,
  columns: {
    flags: {
      label: '',
      width: '2rem',
      class: 'centered',
      minWidth: '100px',
    },
    alias: {
      label: 'Alias',
      class: 'centered',
      width: '8.5rem',
      minWidth: '100px',
      searchable: true,
    },
    name: {
      label: 'Name',
      class: 'centered',
      width: '8.5rem',
      minWidth: '100px',
      searchable: true,
    },
    originalName: {
      label: 'Original name',
      class: 'centered',
      width: '8.5rem',
      minWidth: '100px',
      searchable: true,
    },
    id: {
      label: 'File',
      width: '1fr',
    },
  },
});

const rowClass = 'entry';
const minItemSize = 48;
const total = computed(() => entryDetails.entry?.exports.size);
const page = computed(() => ({ name: 'Exports' }));
</script>

<template>
  <BrowserView
    :class="$class()"
    v-bind="page"
    page-icon="package-export"
    :total="total"
    :matched="matched"
    :condensed="true"
    @search="methods.onSearch"
  >
    <template #filters>
      <EntryExportsFilters v-model="filters" />
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
        <EntryExport
          :key="`export-${rowProps.item}`"
          v-bind="rowProps"
        />
      </template>
    </GridView>
  </BrowserView>
</template>

<style lang="scss">
@include color-scheme(light) {
  --entry-exports-grid-header-background-tint: transparent;
}

@include color-scheme(dark) {
  --entry-exports-grid-header-background-tint: #1c151b;
}

.entry-exports {
  --grid-header-background-tint: var(--entry-exports-grid-header-background-tint);
}
</style>
