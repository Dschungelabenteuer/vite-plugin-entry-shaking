<script setup lang="ts" generic="T extends BrowserData">
import { ref, computed, nextTick } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import type { BrowserData, SortableColumn } from '@composable/useBrowserData';
import { useClassNames } from '@composable/useClassNames';
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

type ScrollableViewProps = {
  /** Title of the scrollable view (mostly for a11y). */
  title: string;
  /** List of items. */
  items: any[];
  /** List columns. */
  columns: KeyedColumn[];
  /** Vue-virtual-scroller's min-item size. */
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

type ScrollableViewEvents = {
  /** Emitted when a column is sorted. */
  sort: [column: SortableColumn<any>];
};

const $class = useClassNames('scroller');
const emit = defineEmits<ScrollableViewEvents>();
const props = defineProps<ScrollableViewProps>();

const scrollerRef = ref<HTMLElement>();
const classes = computed(() => [$class(), props.condensed ? 'condensed' : '']);
const rowHeight = computed(() => `${props.minItemSize}px`);
const headerHeight = computed(() => (props.condensed ? '40px' : rowHeight.value));
const gridTemplateColumns = computed(() => props.columns.map((column) => column.width).join(' '));
const sortIcon = computed(() =>
  props.sort.direction === 'asc' ? 'sort-ascending' : 'sort-descending',
);

const onResize = () => {
  // @todo debounce?
  const scrollerEl = scrollerRef.value?.querySelector(`.${$class()}`);
  const scrollerWrapper = scrollerRef.value?.querySelector(`.vue-recycle-scroller__item-wrapper`);
  const scrollerHeader = scrollerRef.value?.querySelector(`.${$class('header')}`);
  (scrollerWrapper as HTMLElement).style.width = `auto`;
  (scrollerHeader as HTMLElement).style.width = `auto`;
  if (props.items.length && scrollerEl && scrollerWrapper) {
    nextTick(() => {
      (scrollerWrapper as HTMLElement).style.width = `${scrollerEl.scrollWidth}px`;
      (scrollerHeader as HTMLElement).style.width = `${scrollerEl.scrollWidth}px`;
    });
  }
};

const handleKeydown = (e) => {
  // @todo
};
</script>

<template>
  <div
    ref="scrollerRef"
    :class="$class('wrapper')"
  >
    <DynamicScroller
      :items="items"
      :min-item-size="minItemSize"
      :emit-update="true"
      :class="classes"
      role="grid"
      tabindex="0"
      :aria-label="title"
      :aria-rowcount="items.length"
      :aria-colcount="columns.length"
      @resize="onResize"
      @keydown="handleKeydown"
    >
      <template #before>
        <div
          :class="$class('header')"
          role="row"
        >
          <div
            v-for="(column, index) in columns"
            :key="column.key"
            :class="column.class"
            role="columnheader"
            :aria-colindex="index + 1"
            :aria-rowindex="1"
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

      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.message]"
          :data-index="index"
          :data-active="active"
          :aria-rowindex="index + 2"
          role="row"
        >
          <slot
            v-bind="{
              item,
              index,
              active,
            }"
          />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<style lang="scss">
@include color-scheme(light) {
  --scrollable-header-background-color: #ffffffaa;
  --scrollable-header-background-tint: transparent;
  --scrollable-header-border-color: var(--overall-border-color);
  --scrollable-header-background-blur: var(--blur-lg);
}

@include color-scheme(dark) {
  --scrollable-header-background-color: var(--overall-background-color);
  --scrollable-header-background-tint: var(--background-gradient);
  --scrollable-header-border-color: var(--overall-border-color);
  --scrollable-header-background-blur: var(--blur-md);
}

.scroller,
.scroller__wrapper {
  height: 100%;
}

.scroller__wrapper:focus-within,
.scroller__wrapper:focus-visible,
.scroller__wrapper:focus {
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

.scroller__header {
  display: grid;
  width: calc(100% - var(--scrollbar-size) - var(--scrollbar-border-width));
  height: v-bind(headerHeight);
  align-items: center;
  grid-template-columns: v-bind(gridTemplateColumns);
  z-index: 20;
  border-top-left-radius: var(--radius-md);
  background-color: var(--scrollable-header-background-color);
  backdrop-filter: var(--scrollable-header-background-blur);
  box-shadow: 0 0 0 1px var(--scrollable-header-border-color);

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
    background: var(--scrollable-header-background-tint);
    background-attachment: fixed;
    background-size: 100vw 100vh;
    left: 0;
    top: 0;
    z-index: -1;
    opacity: 0.72;
  }

  div.centered {
    text-align: center;
  }

  .button {
    margin: auto;
    font-size: inherit;
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  }
}

.scroller {
  overflow: auto;
}

.scroller__wrapper {
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
