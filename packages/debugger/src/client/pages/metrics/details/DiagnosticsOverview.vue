<script setup lang="ts">
import { computed } from 'vue';
import Button from '@components/Button/Button.vue';
import { useClassNames } from '@composables/useClassNames';
import { useBrowserData } from '@views/Browser/useBrowserData';
import BrowserView from '@views/Browser/Browser.vue';
import GridView from '@views/Grid/Grid.vue';
import type { DiagnosticsOverviewProps, DiagnosticsOverviewEvents } from '../Metrics.types';

const $class = useClassNames('diagnostics-overview');
const emit = defineEmits<DiagnosticsOverviewEvents>();
const props = defineProps<DiagnosticsOverviewProps>();

const defaultFilters: string[] = [];
const total = computed(() => props.diagnostics.listPerPath.size);
const source = computed(() =>
  [...props.diagnostics.listPerPath.entries()].map(([path, ids]) => ({
    count: ids.length,
    path,
  })),
);

const { id, title, sort, columns, items, matched, methods } = useBrowserData({
  id: 'diagnostics',
  title: 'Files with diagnostics',
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
    count: {
      label: 'Count',
      class: 'centered',
      width: '5.5rem',
      minWidth: '100px',
      sortable: true,
      ascLabel: 'Show entry with most diagnostics first',
      descLabel: 'Show entry with least diagnostics first',
    },
    id: {
      label: 'File',
      width: '1fr',
      searchable: true,
    },
  },
});

const rowClass = 'diagnostic';
const minItemSize = 48;
const page = {
  name: 'Files with diagnostics',
  pageIcon: 'alert-triangle',
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
        <div :class="$class('access')">
          <Button
            label="Transform details"
            icon="eye"
            :icon-only="true"
            :tooltip-options="{ disabled: true }"
            @click="emit('view', rowProps.item.path)"
          />
        </div>
        <div :class="$class('count')">{{ rowProps.item.count }}</div>
        <div :class="$class('path')">{{ rowProps.item.path }}</div>
      </template>
    </GridView>
  </BrowserView>
</template>

<style lang="scss">
.diagnostics-overview {
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    content: '';
    background: transparent;
    opacity: 0.16;
  }

  &__access {
    position: sticky;
    left: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;

    /* backdrop-filter: blur(3px); // perf issue */

    &::before {
      position: absolute;
      top: -3px;
      left: 0;
      z-index: -1;
      width: 100%;
      height: calc(100% + 3px);
      content: '';
      background: var(--entry-fixed-action-background-tint);
      background-attachment: fixed;
      background-position: left center;
      background-size: 100vw 100vh;
      box-shadow: 1px 0 0 0 var(--grid-header-border-color);
      opacity: 0.82;
    }

    button {
      font-size: var(--font-size-md);
    }
  }

  &__time,
  &__duration {
    font-family: monospace;
    font-size: var(--font-size-xs);
    text-align: center;
  }

  &__path {
    padding-inline: var(--spacing-lg);
    overflow: hidden;
    font-family: monospace;
    font-size: var(--font-size-sm);
    text-overflow: ellipsis;
  }
}
</style>
