<script setup lang="ts" generic="T extends BrowserData">
import { ref, computed, nextTick } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import type { BrowserData, SortableColumn } from '@composable/useBrowserData';
import { useClassNames } from '@composable/useClassNames';
import { useGridNavigation } from '@composable/useGridNavigation';
import Button from '@component/Button.vue';
import type { SortDirection } from '../../types';

export type Column = {
  /** Column class. */
  class?: string;
  /** Column name. */
  label: string;
  /** Column width. */
  width: string;
  /** Column minimal width. */
  minWidth?: string;
  /** Is the column sortable? */
  sortable?: boolean;
  /** Is the column searchable? */
  searchable?: true;
  /** Ascending sorting label. */
  ascLabel?: string;
  /** Descending sorting label. */
  descLabel?: string;
};

export type KeyedColumn = Column & {
  /** Column key. */
  key: string;
};

type GridViewProps = {
  /** Title of the grid view (mostly for a11y). */
  title: string;
  /** List of items. */
  items: any[];
  /** List columns. */
  columns: KeyedColumn[];
  /** Vue-virtual-grid's min-item size. */
  minItemSize: number;
  /** Sort parameters. */
  sort: {
    /** Sort direction. */
    direction?: SortDirection;
    /** Sort parameters. */
    column?: string;
  };
  /** Condensed display? (reduces overall spacing). */
  condensed?: boolean;
};

type GridViewEvents = {
  /** Emitted when a column is sorted. */
  sort: [column: SortableColumn<any>];
};

const $class = useClassNames('grid');
const emit = defineEmits<GridViewEvents>();
const props = defineProps<GridViewProps>();

const gridRef = ref<HTMLElement>();
const classes = computed(() => [$class(), props.condensed ? 'condensed' : '']);
const rowHeight = computed(() => `${props.minItemSize}px`);
const colCount = computed(() => props.columns.length);
const rowCount = computed(() => props.items.length);
const headerRowProps = computed(() => ({ item: undefined, index: -1, active: false }));
const headerHeight = computed(() => (props.condensed ? '40px' : rowHeight.value));
const gridTemplateCols = computed(() => props.columns.map((col) => col.width).join(' '));
const sortIcon = computed(() =>
  props.sort.direction === 'asc' ? 'sort-ascending' : 'sort-descending',
);

const onResize = () => {
  // @todo debounce?
  const gridEl = gridRef.value?.querySelector(`.${$class()}`);
  const gridWrapper = gridRef.value?.querySelector(`.vue-recycle-scroller__item-wrapper`);
  const gridHeader = gridRef.value?.querySelector(`.${$class('header')}`);
  (gridWrapper as HTMLElement).style.width = `auto`;
  (gridHeader as HTMLElement).style.width = `auto`;
  if (props.items.length && gridEl && gridWrapper) {
    nextTick(() => {
      (gridWrapper as HTMLElement).style.width = `${gridEl.scrollWidth}px`;
      (gridHeader as HTMLElement).style.width = `${gridEl.scrollWidth}px`;
    });
  }
};

const grid = useGridNavigation(gridRef, colCount, rowCount);
</script>

<template>
  <div
    ref="gridRef"
    :class="$class('wrapper')"
    role="grid"
    tabindex="0"
    :aria-label="title"
    :aria-rowcount="items.length"
    :aria-colcount="columns.length"
    @keydown="grid.handleShortcut"
  >
    <DynamicScroller
      :items="items"
      :min-item-size="minItemSize"
      :emit-update="true"
      :class="classes"
      @resize="onResize"
    >
      <template #before>
        <div
          v-bind="headerRowProps"
          :class="$class('header')"
          role="row"
          :aria-rowindex="1"
        >
          <div
            v-for="(column, index) in columns"
            :key="column.key"
            :class="column.class"
            role="columnheader"
            :aria-colindex="index + 1"
          >
            <Button
              v-if="column.sortable"
              :label="column.label"
              tabindex="-1"
              :aria-label="sort.direction === 'asc' ? column.descLabel : column.ascLabel"
              :class="{ 'inactive-sort': sort.column !== column.key }"
              :icon="sort.column === column.key ? sortIcon : 'arrows-sort'"
              @click="emit('sort', column.key)"
            />
            <span v-else>
              {{ column.label }}
            </span>
          </div>
        </div>
      </template>

      <template #default="rowProps">
        <DynamicScrollerItem
          :item="rowProps.item"
          :active="rowProps.active"
          :size-dependencies="[rowProps.item.message]"
          :data-index="rowProps.index"
          :data-active="rowProps.active"
          :aria-rowindex="rowProps.index + 2"
          role="row"
        >
          <slot v-bind="rowProps" />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<style lang="scss">
@include color-scheme(light) {
  --grid-header-background-color: #ffffffaa;
  --grid-header-background-tint: transparent;
  --grid-header-border-color: var(--overall-border-color);
  --grid-header-background-blur: var(--blur-lg);
}

@include color-scheme(dark) {
  --grid-header-background-color: var(--overall-background-color);
  --grid-header-background-tint: var(--background-gradient);
  --grid-header-border-color: var(--overall-border-color);
  --grid-header-background-blur: var(--blur-md);
}

.grid,
.grid__wrapper {
  height: 100%;
}

.grid__wrapper:focus-within,
.grid__wrapper:focus-visible,
.grid__wrapper:focus {
  box-shadow: none;
  outline: 0;

  &::before {
    pointer-events: none;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    box-shadow: inset 0 0 0 1px var(--accent-color);
    left: 0;
    top: 0;
    border-radius: var(--radius-md);
    z-index: 100;
    opacity: 1;
  }
}

.grid__header {
  display: grid;
  width: calc(100% - var(--scrollbar-border-width));
  height: v-bind(headerHeight);
  align-items: center;
  grid-template-columns: v-bind(gridTemplateCols);
  grid-template-rows: v-bind(rowHeight);
  z-index: 20;
  border-top-left-radius: var(--radius-md);
  background-color: var(--grid-header-background-color);
  backdrop-filter: var(--grid-header-background-blur);
  box-shadow: 0 0 0 1px var(--grid-header-border-color);

  svg {
    color: var(--accent-color);
  }

  .inactive-sort {
    svg {
      color: inherit;
      opacity: 0.4;
    }
  }

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--grid-header-background-tint);
    background-attachment: fixed;
    background-size: 100vw 100vh;
    left: 0;
    top: 0;
    z-index: -1;
    opacity: 0.72;
  }

  .button {
    margin: auto;
    font-size: inherit;
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  }
}

.grid {
  overflow: auto;
}

.grid__wrapper {
  position: relative;
  overflow: hidden;
}

.vue-recycle-scroller {
  &__item-wrapper {
    overflow: visible !important;
  }

  &__slot:first-of-type {
    z-index: 20;
    position: sticky;
    top: 0;
  }

  &__slot:last-of-type {
    z-index: 20;
    position: sticky;
    bottom: 0;
  }
}
</style>
