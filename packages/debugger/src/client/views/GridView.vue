<script setup lang="ts" generic="Cols extends Record<string, Column>, Items extends any[]">
import { ref, computed, nextTick } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

import { useMediaQuery } from '@vueuse/core';
import Button from '@component/Button.vue';

import type { SortableColumn } from '@composable/useBrowserData';
import { useClassNames } from '@composable/useClassNames';
import { useGridNavigation, Row } from '@composable/useDataGrid';

import type { ShortcutGroup } from '@helpers/ShortcutsHelper.vue';
import ShortcutsHelper from '@helpers/ShortcutsHelper.vue';

import type { SortDirection } from '../../types';

export type GridRowProps<T = any> = {
  /** Item data. */
  item: T;
  /** Item index. */
  index: number;
  /** Is the item active in virtual scroll? */
  active: boolean;
  /** Column count. */
  colCount: number;
  /** Item with size. */
  itemWithSize: T;
};

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

type GridSortOptions = {
  /** Sort direction. */
  direction?: SortDirection;
  /** Sort parameters. */
  column?: keyof Cols;
};

type GridViewProps = {
  /** Grid key */
  id: string;
  /** Title of the grid view (mostly for a11y). */
  title: string;
  /** List of items. */
  items: Items;
  /** Class applied to all rows. */
  rowClass?: string | ((item: Items[number]) => string);
  /** Condensed display? (reduces overall spacing). */
  condensed?: boolean;
  /** List columns. */
  columns: Cols;
  /** Vue-virtual-grid's min-item size. */
  minItemSize: number;
  /** Sort parameters. */
  sort: GridSortOptions;
};

type GridViewEvents = {
  /** Emitted when a column is sorted. */
  sort: [column: SortableColumn<any>];
  /** Emitted when trying to view details of a given row. */
  view: [itemPath: string];
};

type GridViewSlots = {
  /** Row content. */
  row(props: GridRowProps<Items[number]>): any;
};

const $class = useClassNames('grid');
const emit = defineEmits<GridViewEvents>();
const props = defineProps<GridViewProps>();
const slots = defineSlots<GridViewSlots>();
const ASC_ICON = 'sort-ascending';
const DESC_ICON = 'sort-descending';
const shortcuts = computed<ShortcutGroup[]>(() => [
  {
    // Basic navigation.
    items: [
      { key: 'ArrowUp', label: 'Previous row', disabled: grid.firstRowReached.value },
      { key: 'ArrowDown', label: 'Next row', disabled: grid.lastRowReached.value },
      { key: 'ArrowLeft', label: 'Previous column', disabled: grid.firstColReached.value },
      { key: 'ArrowRight', label: 'Next column', disabled: grid.lastColReached.value },
    ],
  },
  {
    // Quick navigation.
    items: [
      { key: 'PageUp', label: 'First visible row', disabled: grid.firstRowReached.value },
      { key: 'PageDown', label: 'Last visible row', disabled: grid.lastRowReached.value },
      { key: 'Home', label: 'First row', disabled: grid.firstRowReached.value },
      { key: 'End', label: 'Last row', disabled: grid.lastRowReached.value },
    ],
  },
  {
    // Controls.
    items: [
      { key: ['CTRL', 'F'], label: 'Search' },
      { key: ['CTRL', 'O'], label: 'Change filters' },
      { key: ['CTRL', 'Enter'], label: 'Open item' },
      { key: 'H', label: 'Toggle shortcut list' },
    ],
  },
]);

const gridRef = ref<HTMLElement>();
const classes = computed(() => [$class(), props.condensed ? 'condensed' : '']);
const cols = computed(() => Object.entries(props.columns).map(([key, col]) => ({ key, ...col })));
const gridTemplateCols = computed(() => cols.value.map((col) => col.width).join(' '));
const headerRowProps = computed(() => ({ item: undefined, index: -1, active: false }));
const headerHeight = computed(() => (props.condensed ? '40px' : rowHeight.value));
const rowHeight = computed(() => `${props.minItemSize}px`);
const rowCount = computed(() => props.items.length);
const colCount = computed(() => cols.value.length);
const sortIcon = computed(() => (props.sort.direction === 'asc' ? ASC_ICON : DESC_ICON));
const showHelper = useMediaQuery('(min-width: 756px)');

const getRowClass = (item: Items[number]) =>
  typeof props.rowClass === 'function' ? props.rowClass(item) : props.rowClass;

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

const prepareRowProps = (rowProps: GridRowProps<Items[number]>) => ({
  ...rowProps,
  colCount: colCount.value,
  index: rowProps.index ?? 0,
});

const list = computed(() => props.items);
const grid = useGridNavigation(gridRef, colCount, rowCount);
</script>

<template>
  <div
    ref="gridRef"
    :class="$class('wrapper')"
    role="grid"
    tabindex="0"
    :aria-label="title"
    :aria-rowcount="rowCount"
    :aria-colcount="colCount"
    @keydown="grid.handleShortcut"
  >
    <DynamicScroller
      :items="list"
      :min-item-size="minItemSize"
      :class="classes"
      @resize="onResize"
    >
      <template #before>
        <div
          v-bind="headerRowProps"
          :class="[$class('header'), $class('row')]"
          role="row"
          :aria-rowindex="1"
        >
          <div
            v-for="(column, index) in cols"
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
          <Row
            :class="getRowClass(rowProps.item)"
            :row-index="rowProps.index"
            :columns="cols"
            @cell-click="grid.handleCellClick"
          >
            <slot
              name="row"
              v-bind="prepareRowProps(rowProps)"
            />
          </Row>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
  <ShortcutsHelper
    v-if="showHelper"
    id="grid-shortcuts"
    message="Use arrow keys to browse data"
    :shortcuts="shortcuts"
    :show-list="grid.isShortcutListOpen.value"
    :show-tooltip="grid.isGridFocused.value && grid.activeRow.value === 0"
    @close-list="() => (grid.isShortcutListOpen.value = false)"
  />
</template>

<style lang="scss" scoped>
.grid__header {
  height: v-bind(headerHeight);
  grid-template-columns: v-bind(gridTemplateCols);
}

:deep(.grid__row) {
  grid-template-columns: v-bind(gridTemplateCols);
  height: 2.75rem;
}
</style>

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

.grid {
  height: 100%;
  overflow: auto;
}

.grid__wrapper {
  height: 100%;
  position: relative;
  overflow: hidden;
  position: relative;
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

.grid__row {
  display: grid;
  align-items: center;
  padding-block: var(--spacing-sm);
  min-width: max-content;
  @include border-bottom;

  [aria-colindex] {
    display: flex;
    align-items: center;
    height: 100%;

    &.centered {
      justify-content: center;
    }

    &:not(.centered):not(.no-padding) {
      padding-inline: var(--spacing-lg);
    }
  }

  [aria-colindex]:focus,
  [aria-colindex]:focus-visible {
    border-radius: calc(var(--radius-md) + 6px);
    outline: 0;
    box-shadow:
      inset 0 0 0 1px var(--button-outline-color),
      inset 0 0 0 4px var(--background-color),
      inset 0 0 0 6px var(--accent-color);
  }
}

.grid__header {
  display: grid;
  width: calc(100% - var(--scrollbar-border-width));
  align-items: center;
  z-index: 20;
  padding-block: 0;
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
