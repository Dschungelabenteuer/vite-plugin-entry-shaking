<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useRoute } from 'vue-router';

import { store } from '#store';
import { useBrowserData } from '@composable/useBrowserData';
import BrowserView from '@views/BrowserView.vue';
import GridView from '@views/GridView.vue';

import Transform from './Transform.vue';

const route = useRoute();
const ctxStore = toRefs(store);

const defaultFilters: string[] = [];
const { id, title, sort, columns, items, filters, matched, methods } = useBrowserData({
  id: 'transforms',
  title: 'List of transforms',
  source: ctxStore.transforms,
  filterFn: (item, f) => true,
  defaultFilters,
  columns: {
    icon: {
      label: '',
      width: '2.5rem',
      minWidth: '100px',
      class: 'no-padding',
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

const rowClass = 'transform';
const minItemSize = 48;
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
    <!-- <template #filters>
      <TransformsFilters v-model="filters" />
    </template> -->

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
        <Transform v-bind="rowProps" />
      </template>
    </GridView>
  </BrowserView>
</template>
