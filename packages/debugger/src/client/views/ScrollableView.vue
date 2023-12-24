<script setup lang="ts">
import Button from '@component/Button.vue';
import { ref, computed, nextTick } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import type { SortDirection } from '../../types';

export type Column = {
  /** Column class. */
  class?: string;
  /** Column key. */
  key: string;
  /** Column name. */
  label: string;
  /** Column width. */
  width: string;
  /** Column minimal width. */
  minWidth?: string;
  /** Is the column sortable? */
  sortable?: boolean;
};

type ScrollableViewProps = {
  /** List of items. */
  items: any[];
  /** List columns. */
  columns: Column[];
  /** Vue-virtual-scroller's min-item size. */
  minItemSize: number;
  /** Sort direction */
  sort?: SortDirection;
};

const props = defineProps<ScrollableViewProps>();
const emit = defineEmits<{ sort: [columnKey: string] }>();
const scrollerClass = 'scroller';
const scrollerRef = ref<HTMLElement>();
const rowHeight = computed(() => `${props.minItemSize}px`);
const gridTemplateColumns = computed(() => props.columns.map((column) => column.width).join(' '));
const sortLabel = computed(() =>
  props.sort === 'asc' ? 'Sort from newest to oldest' : 'Sort from oldest to newest',
);
const onResize = () => {
  const scrollerEl = scrollerRef.value?.querySelector(`.${scrollerClass}`);
  const scrollerWrapper = scrollerRef.value?.querySelector(`.vue-recycle-scroller__item-wrapper`);
  const scrollerHeader = scrollerRef.value?.querySelector(`.${scrollerClass}__header`);
  (scrollerWrapper as HTMLElement).style.width = `auto`;
  (scrollerHeader as HTMLElement).style.width = `auto`;
  if (props.items.length && scrollerEl && scrollerWrapper) {
    nextTick(() => {
      (scrollerWrapper as HTMLElement).style.width = `${scrollerEl.scrollWidth}px`;
      (scrollerHeader as HTMLElement).style.width = `${scrollerEl.scrollWidth}px`;
    });
  }
};
</script>

<template>
  <div
    ref="scrollerRef"
    class="scroller__wrapper"
  >
    <DynamicScroller
      :items="items"
      :min-item-size="minItemSize"
      :emit-update="true"
      :class="scrollerClass"
      @resize="onResize"
    >
      <template #before>
        <div class="scroller__header">
          <div
            v-for="column in columns"
            :key="column.key"
            :class="column.class"
          >
            <Button
              v-if="column.sortable"
              :label="column.label"
              :aria-label="sortLabel"
              :icon="sort === 'asc' ? 'arrow-down' : 'arrow-up'"
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

.scroller__header {
  display: grid;
  width: calc(100% - var(--scrollbar-size) - var(--scrollbar-border-width));
  height: v-bind(rowHeight);
  align-items: center;
  grid-template-columns: v-bind(gridTemplateColumns);
  z-index: 20;
  border-top-left-radius: var(--radius-md);
  background-color: var(--scrollable-header-background-color);
  backdrop-filter: var(--scrollable-header-background-blur);
  box-shadow: 0 0 0 1px var(--scrollable-header-border-color);

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
