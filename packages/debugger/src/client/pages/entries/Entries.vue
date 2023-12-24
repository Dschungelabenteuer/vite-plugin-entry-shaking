<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import BrowserView from '@views/BrowserView.vue';
import ScrollableView from '@views/ScrollableView.vue';
import { store } from '#store';

import type { EntryProps } from './Entry.vue';
import Entry from './Entry.vue';
import EntriesFilters from './EntriesFilters.vue';

const route = useRoute();
const search = ref<string | undefined>(undefined);
const filters = ref<string[]>(['debug', 'info', 'warn', 'error']);
const items = computed(
  () =>
    [...store.entries.entries()]?.reduce(
      (entryList, [entryPath, entry]) => {
        if (search.value && !entryPath.includes(search.value)) return entryList;
        // if (!filters.value?.includes(entry.)) return entryList;
        const index = entryList.length + 1;
        return [...entryList, { ...entry, path: entryPath, id: index, index }] as Omit<
          EntryProps,
          'columns'
        >[];
      },
      [] as Omit<EntryProps, 'columns'>[],
    ),
);

const total = computed(() => store.entries?.size);
const matched = computed(() => items.value.length);
const page = computed(() => ({ name: route.name as string, pageIcon: route.meta.icon as string }));
const columns = computed(() => [
  {
    key: 'level',
    label: '',
    width: '2.5rem',
    minWidth: '100px',
  },
  {
    key: 'path',
    label: 'Path',
    width: '20rem',
  },
  {
    key: 'referer',
    label: 'Imported by',
    width: '20rem',
  },
  {
    key: 'exports-count',
    label: 'Exports',
    width: '6rem',
  },
  {
    key: 'wildcards-counts',
    label: 'Wildcards',
    width: '10rem',
  },
  {
    key: 'actions',
    label: 'Actions',
    width: '5rem',
  },
]);

const onSearch = (q: string) => {
  const searched = q.trim();
  search.value = searched.length ? searched : undefined;
};

const onFilterChange = (filterList: string[]) => {
  filters.value = filterList;
};
</script>

<template>
  <BrowserView
    v-bind="page"
    :total="total"
    :matched="matched"
    @search="onSearch"
  >
    <template #filters>
      <EntriesFilters
        :filters="filters"
        @filter="onFilterChange"
      />
    </template>

    <ScrollableView v-bind="{ columns, items, minItemSize: 44 }">
      <template #default="{ item, index }">
        <Entry
          :key="`entry-${index}`"
          :columns="columns"
          v-bind="item"
        />
      </template>
    </ScrollableView>
  </BrowserView>
</template>
