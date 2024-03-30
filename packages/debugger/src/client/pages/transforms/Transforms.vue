<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import type { TransformData } from 'vite-plugin-entry-shaking';

import { relativePath } from '#utils';
import { store } from '#store';
import Button from '@components/Button/Button.vue';
import Dialog from '@components/Dialog/Dialog.vue';
import { useBrowserData } from '@views/Browser/useBrowserData';
import BrowserView from '@views/Browser/Browser.vue';
import GridView from '@views/Grid/Grid.vue';

import Transform from './Transform.vue';
import TransformDetails from './TransformDetails.vue';

const route = useRoute();
const dialogRef = ref<InstanceType<typeof Dialog> | null>(null);
const ctxStore = toRefs(store);
const source = computed(() =>
  [...ctxStore.transforms.value.entries()].map(([path, transform]) => ({
    ...transform,
    absolutePath: path,
    relativePath: relativePath(store.root, path),
  })),
);

const defaultFilters: string[] = [];
const { id, title, sort, columns, items, matched, methods } = useBrowserData({
  id: 'transforms',
  title: 'List of transforms',
  source,
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
const total = computed(() => store.transforms?.size ?? 0);
const page = computed(() => ({ name: route.name as string, pageIcon: route.meta.icon as string }));
const activeTransform = ref<TransformData | undefined>(undefined);
const activePath = ref<string | undefined>(undefined);
const activeRelativePath = computed(() => relativePath(store.root, activePath.value ?? ''));
const handleTransformView = (path: string) => {
  activePath.value = path;
  activeTransform.value = store.transforms?.get(path);
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
        <Transform
          v-bind="rowProps"
          @view="handleTransformView"
        />
      </template>
    </GridView>
  </BrowserView>

  <Dialog
    ref="dialogRef"
    title="Transform data"
    width="640px"
    height="480px"
    @close="activeTransform = undefined"
  >
    <TransformDetails
      :transform="activeTransform"
      :relative-path="activeRelativePath"
      :absolute-path="activePath ?? ''"
      @end-reached="() => dialogRef?.focusFirst()"
    />

    <template #footer>
      <Button
        label="Close"
        icon="x"
        shortcut="ESC"
        :class="['bordered', 'small']"
        @click="dialogRef?.element?.close()"
      />
    </template>
  </Dialog>
</template>
