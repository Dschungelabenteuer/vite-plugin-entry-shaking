<script setup lang="ts">
import { computed, inject } from 'vue';

import Button from '@components/Button/Button.vue';
import type { ClassNameFn } from '@composables/useClassNames';
import type { GridHeaderProps, GridSortFn } from './Grid.types';

const $class = inject<ClassNameFn>('$class')!;
const props = defineProps<GridHeaderProps>();

const onSort = inject<GridSortFn>('onSort')!;

const ASC_ICON = 'sort-ascending';
const DESC_ICON = 'sort-descending';
const headerRowProps = computed(() => ({ item: undefined, index: -1, active: false }));
const sortIcon = computed(() => (props.sort.direction === 'asc' ? ASC_ICON : DESC_ICON));
</script>

<template>
  <Transition
    tag="div"
    :class="$class()"
    name="list"
  >
    <div
      v-if="ready"
      v-bind="headerRowProps"
      :class="[$class('header'), $class('row')]"
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
          @click="onSort(column)"
        />
        <span v-else>
          {{ column.label }}
        </span>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
.grid {
  &__header {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: v-bind(gridTemplateCols);
    align-items: center;
    width: calc(100% - var(--scrollbar-border-width));
    height: v-bind(headerHeight);
    padding-block: 0;
    background-color: var(--grid-header-background-color);
    backdrop-filter: var(--grid-header-background-blur);
    border-top-left-radius: var(--radius-md);
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
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      content: '';
      background: var(--grid-header-background-tint);
      background-attachment: fixed;
      background-size: 100vw 100vh;
      opacity: 0.72;
    }

    .button {
      margin: auto;
      font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
      font-size: inherit;
    }
  }
}
</style>
