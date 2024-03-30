<script setup lang="ts">
import { watch, computed, onMounted, ref, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { EntryData } from 'vite-plugin-entry-shaking';

import { relativePath } from '#utils';
import { store } from '#store';
import Button from '@components/Button/Button.vue';
import Dialog from '@components/Dialog/Dialog.vue';
import { useBrowserData } from '@views/Browser/useBrowserData';
import BrowserView from '@views/Browser/Browser.vue';
import GridView from '@views/Grid/Grid.vue';

import Entry from './Entry.vue';
import EntriesFilters from './EntriesFilters.vue';
import EntryDetails from './EntryDetails.vue';

const router = useRouter();
const route = useRoute();
const dialogRef = ref<InstanceType<typeof Dialog> | null>(null);
const ctxStore = toRefs(store);
const source = computed(() =>
  [...ctxStore.entries.value.entries()].map(([path, entry]) => ({
    ...entry,
    absolutePath: path,
    relativePath: relativePath(store.root, path),
  })),
);

const defaultFilters: ('implicit' | 'explicit')[] = ['implicit', 'explicit'];
const { id, title, sort, columns, items, filters, matched, methods } = useBrowserData({
  id: 'entries',
  title: 'List of entries',
  source,
  filterFn: (item, levels) => levels.includes(item.isImplicit ? 'implicit' : 'explicit'),
  defaultFilters,
  columns: {
    icon: {
      label: '',
      width: '2.5rem',
      class: 'no-padding',
      minWidth: '100px',
    },
    time: {
      label: 'Time (total)',
      class: 'centered',
      width: '8.5rem',
      minWidth: '100px',
      sortable: true,
      ascLabel: 'Total time: show slowest first',
      descLabel: 'Total time: show fastest first',
    },
    self: {
      label: 'Time (self)',
      class: 'centered',
      width: '8.5rem',
      minWidth: '100px',
      sortable: true,
      ascLabel: 'Self time: show slowest first',
      descLabel: 'Self time: show fastest first',
    },
    isImplicit: {
      label: '',
      width: '2rem',
      class: 'centered',
      minWidth: '100px',
    },
    path: {
      label: 'File',
      width: '1fr',
      searchable: true,
    },
  },
});

const rowClass = 'entry';
const minItemSize = 48;
const total = computed(() => store.entries?.size);
const page = computed(() => ({ name: route.name as string, pageIcon: route.meta.icon as string }));
const activeEntry = ref<EntryData | undefined>(undefined);
const activePath = ref<string | undefined>(undefined);
const activeRelativePath = computed(() => relativePath(store.root, activePath.value ?? ''));
const handleEntryView = (path: string) => {
  activePath.value = path;
  activeEntry.value = store.entries?.get(path);
  dialogRef.value?.element?.showModal();
};

const handleRouteParams = () => {
  if (route.params.path) {
    handleEntryView(route.params.path as string);
  }
};

const handleDetailsClose = () => {
  activeEntry.value = undefined;
  router.push({ name: 'Entries' });
};

watch(route, handleRouteParams);

onMounted(() => {
  handleRouteParams();
});
</script>

<template>
  <BrowserView
    v-bind="page"
    :total="total"
    :matched="matched"
    @search="methods.onSearch"
  >
    <template #filters>
      <EntriesFilters v-model="filters" />
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
        <Entry
          v-bind="rowProps"
          @view="handleEntryView"
        />
      </template>
    </GridView>
  </BrowserView>

  <Dialog
    ref="dialogRef"
    title="Entry data"
    width="960px"
    height="640px"
    @close="handleDetailsClose"
  >
    <EntryDetails
      :entry="activeEntry"
      :relative-path="activeRelativePath"
      :absolute-path="activePath ?? ''"
      @end-reached="() => dialogRef?.focusFirst()"
    />

    <template #footer>
      <Button
        label="Close"
        icon="x"
        shortcut="ESC"
        :bordered="true"
        :class="['bordered', 'small']"
        @click="dialogRef?.element?.close()"
      />
    </template>
  </Dialog>
</template>
