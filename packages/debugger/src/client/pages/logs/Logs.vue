<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import BrowserView from '@views/BrowserView.vue';
import ScrollableView from '@views/ScrollableView.vue';
import { store } from '#store';

import type { SortDirection } from '../../../types';
import type { LogProps } from './Log.vue';
import Log from './Log.vue';
import LogsFilters from './LogsFilters.vue';

const route = useRoute();
const sort = ref<SortDirection>('asc');
const search = ref<string | undefined>(undefined);
const filters = ref<string[]>(['debug', 'info', 'warn', 'error']);
const items = computed(() => {
  const logs = store.logs?.reduce(
    (logList, log) => {
      if (search.value && !log.content.includes(search.value)) return logList;
      if (!filters.value?.includes(log.level)) return logList;
      const index = logList.length + 1;
      return [...logList, { ...log, id: index, index }];
    },
    [] as Omit<LogProps, 'columns'>[],
  );

  return sort.value === 'asc' ? logs : logs?.reverse();
});

const total = computed(() => store.logs?.length);
const matched = computed(() => items.value.length);
const page = computed(() => ({ name: route.name as string, pageIcon: route.meta.icon as string }));
const columns = computed(() => [
  {
    key: 'level',
    label: '',
    width: '2rem',
    minWidth: '100px',
  },
  {
    key: 'timestamp',
    label: 'Time',
    class: 'centered',
    width: '5rem',
    minWidth: '100px',
    sortable: true,
  },
  {
    key: 'content',
    label: 'Content',
    width: '1fr',
  },
]);

const onSortChange = () => {
  sort.value = sort.value === 'asc' ? 'desc' : 'asc';
};

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
      <LogsFilters
        :filters="filters"
        @filter="onFilterChange"
      />
    </template>

    <ScrollableView
      v-bind="{ columns, items, minItemSize: 48, sort }"
      @sort="onSortChange"
    >
      <template #default="{ item, index }">
        <Log
          :key="`log-${index}`"
          :columns="columns"
          v-bind="item"
        />
      </template>
    </ScrollableView>
  </BrowserView>
</template>
