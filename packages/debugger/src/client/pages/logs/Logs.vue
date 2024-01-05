<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useRoute } from 'vue-router';

import { store } from '#store';
import { useBrowserData } from '@composable/useBrowserData';
import BrowserView from '@views/BrowserView.vue';
import ScrollableView from '@views/ScrollableView.vue';

import Log from './Log.vue';
import LogsFilters from './LogsFilters.vue';

const route = useRoute();
const ctxStore = toRefs(store);
const { sort, columns, items, filters, matched, methods } = useBrowserData({
  source: ctxStore.logs,
  filters: (item, filtersObj) => {
    console.info(item, filtersObj);
    return true;
  },
  columns: {
    level: {
      label: '',
      width: '2rem',
      minWidth: '100px',
    },
    timestamp: {
      key: 'timestamp',
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
      <LogsFilters
        :filters="filters"
        @filter="methods.onFilterChange"
      />
    </template>

    <ScrollableView
      v-bind="{ columns, items, minItemSize: 48, sort }"
      @sort="methods.onSortChange"
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
