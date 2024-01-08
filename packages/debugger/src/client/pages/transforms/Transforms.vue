<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useRoute } from 'vue-router';

import { store } from '#store';
import { useBrowserData } from '@composable/useBrowserData';
import BrowserView from '@views/BrowserView.vue';
import GridView from '@views/GridView.vue';

import Transform from './Transform.vue';
import TransformsFilters from './TransformsFilters.vue';

const route = useRoute();
const ctxStore = toRefs(store);
const { title, sort, columns, items, filters, matched, methods } = useBrowserData({
  title: 'List of transforms',
  source: ctxStore.transforms,
  filters: () => true,
  columns: {
    icon: {
      label: '',
      width: '2.5rem',
      minWidth: '100px',
    },
    timestamp: {
      label: 'Time',
      class: 'centered',
      width: '5.5rem',
      minWidth: '100px',
      sortable: true,
      ascLabel: 'Show newest first',
      descLabel: 'Show oldest first',
    },
    time: {
      label: 'Transform time',
      class: 'centered',
      width: '10.5rem',
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

const total = computed(() => store.transforms?.length);
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
      <TransformsFilters
        :filters="filters"
        @filter="methods.onFilterChange"
      />
    </template>

    <GridView
      v-bind="{ title, columns, items, minItemSize: 48, sort }"
      @sort="methods.onSortChange"
    >
      <template #default="{ item, index }">
        <Transform
          :key="`transform-${index}`"
          :columns="columns"
          v-bind="item"
        />
      </template>
    </GridView>
  </BrowserView>
</template>
