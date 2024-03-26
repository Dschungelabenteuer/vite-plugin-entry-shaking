<script setup lang="ts" generic="Cols extends Record<string, Column>, Items extends any[]">
import { ref, computed, provide, onMounted } from 'vue';

import Shortcuts from '@components/Shortcuts/Shortcuts.vue';
import { useClassNames } from '@composables/useClassNames';
import VirtualScrollView from '@views/VirtualScroll/VirtualScroll.vue';
import type { GridEvents, GridProps, GridSlots, Column, GridSortFn } from './Grid.types';
import { useGrid } from './useGrid';
import { Row } from './Grid.row';
import GridHeader from './GridHeader.vue';

const $class = useClassNames('grid');
const emit = defineEmits<GridEvents>();
const props = defineProps<GridProps<Cols, Items>>();
const slots = defineSlots<GridSlots<Items>>();

const onSort: GridSortFn = (column) => emit('sort', column.key);
const classes = computed(() => [$class(), props.condensed ? 'condensed' : '']);
const gridRef = ref<HTMLElement | null>(null);
const ready = ref<boolean>(false);
const { data, controls, layout } = useGrid(props, gridRef, $class);
const { gridTemplateCols, rowHeight } = layout;
onMounted(() => {
  ready.value = true;
});

provide('$class', $class);
provide('gridRef', gridRef);
provide('onSort', onSort);
</script>

<template>
  <div
    ref="gridRef"
    :class="$class('wrapper')"
    role="grid"
    tabindex="0"
    :aria-label="title"
    :aria-rowcount="data.rowCount"
    :aria-colcount="data.colCount"
    @keydown="controls.handleShortcut"
  >
    <VirtualScrollView
      :items="data.rows"
      :item-size="minItemSize"
      :class="classes"
      :overflow-delay="layout.transitionDuration"
      @resize="() => layout.recomputedWidth('resize')"
      @scroll="() => layout.recomputedWidth('scroll')"
    >
      <template #before>
        <GridHeader
          :ready
          :columns="data.columns"
          :sort
          :grid-template-cols="layout.gridTemplateCols"
          :header-height="layout.headerHeight"
        />
      </template>

      <template #default="{ item }">
        <Row
          :class="layout.getRowClass(item)"
          :row-index="item.index"
          :columns="data.columns"
          :item-size="minItemSize"
          :active-row="data.activeRow"
          :active-col="data.activeCol"
          @cell-click="controls.handleCellClick"
        >
          <slot
            name="row"
            v-bind="data.prepareRowProps(item)"
          />
        </Row>
      </template>
    </VirtualScrollView>
  </div>
  <Shortcuts
    v-if="layout.showHelper"
    id="grid-shortcuts"
    message="Use arrow keys to browse data"
    :shortcuts="controls.shortcuts"
    :show-list="data.isShortcutListOpen"
    :show-tooltip="controls.isGridFocused && data.activeRow === 0"
    @close-list="() => (data.isShortcutListOpen = false)"
  />
</template>

<style lang="scss" scoped>
/* stylelint-disable-next-line selector-class-pattern */
:deep(.grid__row) {
  grid-template-columns: v-bind(gridTemplateCols);
  height: v-bind(rowHeight);
}
</style>

<style lang="scss">
@include color-scheme(light) {
  --grid-header-background-color: #fffa;
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

  &__wrapper {
    position: relative;
    height: 100%;
    overflow: hidden;

    &:focus-within,
    &:focus-visible,
    &:focus {
      outline: 0;
      box-shadow: none;

      &::before {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 100;
        width: 100%;
        height: 100%;
        pointer-events: none;
        content: '';
        border-radius: var(--radius-md);
        box-shadow: inset 0 0 0 1px var(--accent-color);
        opacity: 1;
      }
    }
  }

  &__row {
    display: grid;
    align-items: center;
    min-width: max-content;

    // Somehow using box-shadow for border prevents smooth
    border-bottom: 1px solid var(--overall-border-color);

    [aria-colindex] {
      display: flex;
      align-items: center;
      height: 100%;

      &.centered {
        justify-content: center;
      }

      &:not(.centered, .no-padding) {
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
}
</style>
