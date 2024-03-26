import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { getCustomProperty, parseCssDuration } from '#utils';
import type { ClassNameFn } from '@composables/useClassNames';
import { VIRTUAL_SCROLL_WRAPPER_CLASS } from '@views/VirtualScroll/useVirtualScroll';
import type { Column, GridProps, RenderTracker, UseGridDataReturn } from './Grid.types';

export const renderCallback = ref<undefined | RenderTracker>(undefined);

export function useGridLayout<Cols extends Record<string, Column>, Items extends any[]>(
  props: GridProps<Cols, Items>,
  gridRef: Ref<HTMLElement | null>,
  gridScrollerRef: Ref<HTMLElement | null>,
  data: UseGridDataReturn,
  $class: ClassNameFn,
) {
  const scrollWidth = computed(() => gridScrollerRef.value?.scrollWidth ?? 0);
  const scrollLeft = computed(() => gridScrollerRef.value?.scrollLeft ?? 0);
  const scrollHeight = computed(() => gridScrollerRef.value?.scrollHeight ?? 0);
  const scrollTop = computed(() => gridScrollerRef.value?.scrollTop ?? 0);

  const transitionDuration = parseCssDuration(getCustomProperty('--list-translate-x-duration'));
  const gridTemplateCols = computed(() => data.columns.value.map((col) => col.width).join(' '));
  const headerHeight = computed(() => (props.condensed ? '40px' : rowHeight.value));
  const rowHeight = computed(() => `${props.minItemSize}px`);
  const showHelper = useMediaQuery('(min-width: 756px)');

  const getRowClass = (item: Items[number]) =>
    typeof props.rowClass === 'function' ? props.rowClass(item) : props.rowClass;

  const recomputedWidth = (_origin?: string) => {
    const gridWrapper = gridRef.value?.querySelector(`.${VIRTUAL_SCROLL_WRAPPER_CLASS}`);
    if (gridWrapper) {
      const gridHeader = gridRef.value?.querySelector(`.${$class('header')}`);
      (gridWrapper as HTMLElement).parentElement!.style.width = `auto`;
      (gridWrapper as HTMLElement).style.width = `auto`;
      const setWidth = (width: string) => {
        (gridWrapper as HTMLElement).parentElement!.style.width = width;
        (gridWrapper as HTMLElement).style.width = width;
        if (gridHeader) (gridHeader as HTMLElement).style.width = width;
      };

      setWidth(`calc(${gridWrapper.scrollWidth - 1}px)`);
    }
  };

  return {
    /** Scroller's scrollWidth. */
    scrollWidth,
    /** Scroller's left position. */
    scrollLeft,
    /** Scroller's scrollHeight. */
    scrollHeight,
    /** Scroller's top position. */
    scrollTop,

    /** Translates element's CSS `transition-duration` into a primitive ms value. */
    transitionDuration,
    /** CSS's `grid-template-cols` property value. */
    gridTemplateCols,
    /** Header height. */
    headerHeight,
    /** Row height. */
    rowHeight,

    /** Determines whether we should show the shortcuts helper. */
    showHelper,
    /** Returns a single row's class name. */
    getRowClass,
    /** Recomputes scroller's width based on refreshed content. */
    recomputedWidth,
  };
}
