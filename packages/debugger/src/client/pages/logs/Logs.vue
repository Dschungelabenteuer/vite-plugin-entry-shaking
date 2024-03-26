<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import type { LogLevel } from 'vite-plugin-entry-shaking';

import { store } from '#store';
import { useBrowserData } from '@views/Browser/useBrowserData';
import BrowserView from '@views/Browser/Browser.vue';
import GridView from '@views/Grid/Grid.vue';

import Log from './Log.vue';
import LogsFilters from './LogsFilters.vue';

const route = useRoute();
const ctxStore = toRefs(store);
const defaultFilters: LogLevel[] = ['debug', 'info', 'warn', 'error', 'success'];
const { id, title, sort, columns, items, filters, matched, methods } = useBrowserData({
  id: 'logs',
  title: 'List of logs',
  source: ctxStore.logs,
  filterFn: (item, levels) => levels.includes(item.level),
  defaultFilters,
  columns: {
    level: {
      label: '',
      width: '2.5rem',
      minWidth: '100px',
      class: 'centered',
    },
    timestamp: {
      label: 'Time',
      class: 'centered',
      width: '5rem',
      minWidth: '100px',
      sortable: true,
      ascLabel: 'Show newest first',
      descLabel: 'Show oldest first',
    },
    content: {
      label: 'Content',
      width: '1fr',
      searchable: true,
    },
  },
});
const rowClass = (props: (typeof items.value)[number]) => `log ${props.level}`;
const minItemSize = 48;
const total = computed(() => store.logs?.length);
const page = computed(() => ({ name: route.name as string, pageIcon: route.meta.icon as string }));
</script>

<template>
  <BrowserView
    v-bind="page"
    :total="total"
    :matched="matched"
    @search="methods.onSearch"
  >
    <template #filters>
      <LogsFilters v-model="filters" />
    </template>

    <GridView
      :id="id"
      :items="items"
      :title="title"
      :columns="columns"
      :sort="sort"
      :row-class="rowClass"
      :min-item-size="minItemSize"
      @sort="methods.onSortChange"
    >
      <template #row="rowProps">
        <Log v-bind="rowProps" />
      </template>
    </GridView>
  </BrowserView>
</template>
