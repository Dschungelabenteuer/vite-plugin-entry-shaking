<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import BrowserView from '@views/BrowserView.vue';
import ScrollableView from '@views/ScrollableView.vue';
import { store } from '#store';

import type { SortDirection } from '../../../types';
import type { TransformProps } from './Transform.vue';
import Transform from './Transform.vue';
import TransformsFilters from './TransformsFilters.vue';

const route = useRoute();
const sort = ref<SortDirection>('asc');
const search = ref<string | undefined>(undefined);
const filters = ref<string[]>(['debug', 'info', 'warn', 'error']);
const items = computed(() => {
  const transforms = store.transforms?.reduce(
    (transformList, transform) => {
      if (search.value && !transform.content.includes(search.value)) return transformList;
      if (!filters.value?.includes(transform.level)) return transformList;
      const index = transformList.length + 1;
      return [...transformList, { ...transform, id: index, index }];
    },
    [] as Omit<TransformProps, 'columns'>[],
  );

  return sort.value === 'asc' ? transforms : transforms?.reverse();
});

const total = computed(() => store.transforms?.length);
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
      <TransformsFilters
        :filters="filters"
        @filter="onFilterChange"
      />
    </template>

    <ScrollableView
      v-bind="{ columns, items, minItemSize: 48, sort }"
      @sort="onSortChange"
    >
      <template #default="{ item, index }">
        <Transform
          :key="`transform-${index}`"
          :columns="columns"
          v-bind="item"
        />
      </template>
    </ScrollableView>
  </BrowserView>
</template>
