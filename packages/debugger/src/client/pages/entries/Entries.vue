<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { useRoute } from 'vue-router';

import type { EntryData } from 'vite-plugin-entry-shaking';
import { store } from '#store';
import { useBrowserData } from '@composable/useBrowserData';
import Button from '@component/Button.vue';
import Dialog from '@component/Dialog.vue';
import BrowserView from '@views/BrowserView.vue';
import GridView from '@views/GridView.vue';

import Entry from './Entry.vue';
import EntriesFilters from './EntriesFilters.vue';
import EntryDetails from './EntryDetails.vue';

const route = useRoute();
const dialogRef = ref<InstanceType<typeof Dialog> | null>(null);
const ctxStore = toRefs(store);
const source = computed(() =>
  [...ctxStore.entries.value.entries()].map(([path, entry]) => ({
    ...entry,
    path,
  })),
);

const { title, sort, columns, items, filters, matched, methods } = useBrowserData({
  title: 'List of entries',
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

const total = computed(() => store.entries?.size);
const page = computed(() => ({ name: route.name as string, pageIcon: route.meta.icon as string }));
const activeEntry = ref<EntryData | undefined>(undefined);
const activePath = ref<string | undefined>(undefined);
const handleEntryView = (path: string) => {
  activePath.value = path;
  activeEntry.value = store.entries?.get(path);
  dialogRef.value?.element?.showModal();
};
</script>

<template>
  <BrowserView
    v-bind="page"
    :total="total"
    :matched="matched"
    @search="methods.onSearch"
  >
    <template #filters>
      <EntriesFilters
        :filters="filters"
        @filter="methods.onFilterChange"
      />
    </template>

    <GridView
      v-bind="{ title, columns, items, minItemSize: 48, sort }"
      @sort="methods.onSortChange"
    >
      <template #default="{ item, index }">
        <Entry
          :key="`entry-${index}`"
          :columns="columns"
          v-bind="item"
          @view="handleEntryView"
        />
      </template>
    </GridView>
  </BrowserView>

  <Dialog
    ref="dialogRef"
    title="Entry data"
    width="680px"
    height="500px"
    @close="activeEntry = undefined"
  >
    <EntryDetails
      :entry="activeEntry"
      :path="activePath"
      @end-reached="() => dialogRef?.focusFirst()"
    />

    <template #footer>
      <Button
        label="Close"
        icon="x"
        shortcut="ESC"
        :bordered="true"
        size="small"
        @click="dialogRef?.element?.close()"
      />
    </template>
  </Dialog>
</template>
