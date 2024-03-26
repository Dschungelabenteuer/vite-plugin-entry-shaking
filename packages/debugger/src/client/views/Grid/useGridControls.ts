import type { Ref } from 'vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { getElementBoundaries } from '#utils';
import type { ShortcutGroup } from '@components/Shortcuts/Shortcuts.types';
import { getFocusableChildren } from '../../composables/useFocusTrap';
import type { Column, GridProps, UseGridDataReturn, UseGridLayoutReturn } from './Grid.types';
import { renderCallback } from './useGridLayout';

/** I like to rove it, rove it. */
export const rove = (el: HTMLElement) => el.setAttribute('tabindex', '-1');
/** So much that I'd do it on every single focusable element. */
export const roveFocusableChildren = (el: HTMLElement) => getFocusableChildren(el)?.forEach(rove);
/** Nevermind I don't like it that much… */
export const unrove = (el: HTMLElement) => el.setAttribute('tabindex', '0');

/**
 * Augments grid's keyboard navigation.
 * Active row and col indices are based on aria indices, which start at 1.
 * @props Grid props.
 * @param gridRef Reference to grid element.
 * @param data Grid data.
 * @param layout Grid layout.
 */
export function useGridControls<Cols extends Record<string, Column>, Items extends any[]>(
  props: GridProps<Cols, Items>,
  gridRef: Ref<HTMLElement | null>,
  data: UseGridDataReturn,
  layout: UseGridLayoutReturn,
) {
  const quickNavLabel = (direction: 'up' | 'down') =>
    `Jump ${data.pageSize.value} rows ${direction}`;

  /** List of elements whose tabindices are changed based on focus. */
  let editedTabindexEls: HTMLElement[] = [];
  /** Is focus set on the grid? */
  const isGridFocused = ref<boolean>(false);
  /** Scrollable grid content boundaries.  */
  const gridScrollerBoundaries = ref<{ top: number; bottom: number }>({ top: 0, bottom: 0 });
  /** Scrollable grid content element. */
  const gridScrollerElement = ref<HTMLElement | null>(null);

  /** Is the first row reached? */
  const firstRowReached = computed(() => data.activeRow.value <= 1);
  /** Is the last row reached? */
  const lastRowReached = computed(() => data.activeRow.value >= data.rowCount.value + 1);
  /** Active row selector. */
  const activeRowSelector = computed(() => `[aria-rowindex="${data.activeRow.value}"]`);
  /** Is the first row reached? */
  const firstColReached = computed(() => data.activeCol.value <= 1);
  /** Is the last row reached? */
  const lastColReached = computed(() => data.activeCol.value >= data.colCount.value);
  /** Active column selector. */
  const activeColumnSelector = computed(() => `[aria-colindex="${data.activeCol.value}"]`);

  const scrollTo = (x: number, y: number) => gridScrollerElement.value?.scrollTo(x, y);
  const scrollToStartX = () => scrollTo(0, layout.scrollTop.value);
  const scrollToEndX = () => scrollTo(layout.scrollWidth.value, layout.scrollTop.value);
  const scrollToStartY = () => scrollTo(layout.scrollLeft.value, 0);
  const scrollToEndY = () => scrollTo(layout.scrollLeft.value, layout.scrollHeight.value);
  const scrollToActiveRow = () =>
    scrollTo(
      layout.scrollLeft.value,
      data.activeRow.value * props.minItemSize - (gridRef.value?.clientHeight ?? 0) / 2,
    );

  /** Whenever a line is mounted, let's add roving tabindex behaviour. */
  onMounted(() => {
    if (!gridRef.value) return;
    gridScrollerElement.value = gridRef.value.querySelector('.grid');
    gridScrollerBoundaries.value = getElementBoundaries(gridScrollerElement.value ?? gridRef.value);
    roveFocusableChildren(gridRef.value);
  });

  /** Resets roving tab index on elements whose tabindices were changed. */
  function resetRovingTabindex() {
    editedTabindexEls.forEach(rove);
    editedTabindexEls = [];
  }

  /**
   * Gets active cell.
   * @param awaitRowRender Whether to wait for row to be rendered.
   */
  async function getActiveCell(awaitRowRender = true) {
    const getCellSelector = () => `${activeRowSelector.value} ${activeColumnSelector.value}`;
    const getCell = () => gridRef.value?.querySelector<HTMLElement>(getCellSelector());
    renderCallback.value?.reject();
    await nextTick();

    return (
      getCell() ??
      (await new Promise((resolve, reject) => {
        if (awaitRowRender) return resolve(undefined);
        renderCallback.value = { resolve, reject, row: data.activeRow.value };
      })
        .then(() => getCell())
        .catch(() => undefined))
    );
  }

  /**
   * Focuses active cell, or first focusable item of active cell if any.
   * @param autoscroll Whether to scroll to the active cell.
   * @param awaitRowRender Whether to wait for row to be rendered.
   */
  async function focusActiveCell(autoscroll = true, awaitRowRender = true) {
    resetRovingTabindex();
    const cell = await getActiveCell(awaitRowRender);
    if (!cell) return scrollToActiveRow();

    const focusableChildren = getFocusableChildren(cell);
    const restoreTabindices = (el: HTMLElement) => {
      unrove(el);
      editedTabindexEls.push(el);
      return el;
    };

    const target =
      focusableChildren && focusableChildren.length
        ? // Reset native tabindex for cell's focusable elements…
          [...focusableChildren].map((el) => restoreTabindices(el))[0]
        : // …or the cell itself as part of the navigation.
          restoreTabindices(cell);

    if (autoscroll) {
      const { bottom, top } = getElementBoundaries(cell);
      const rowSize = cell.parentElement?.getBoundingClientRect().height ?? 0;
      if (gridScrollerBoundaries.value.bottom - bottom <= 1 * rowSize) {
        gridScrollerElement.value?.scrollTo(
          gridScrollerElement.value.scrollLeft,
          gridScrollerElement.value.scrollTop + rowSize,
        );
      } else if (top - gridScrollerBoundaries.value.top <= 1 * rowSize) {
        gridScrollerElement.value?.scrollTo(
          gridScrollerElement.value.scrollLeft,
          gridScrollerElement.value.scrollTop - rowSize,
        );
      }
    }

    target?.focus({
      preventScroll: !autoscroll,
    });
  }

  /**
   * Handles cell click.
   * @param row Row index.
   * @param col Row index.
   */
  function handleCellClick(row: number, col: number) {
    data.activeRow.value = row;
    data.activeCol.value = col;
    focusActiveCell(false);
  }

  /**
   * Handles keyboard shortcuts.
   * @param e Keyboard event.
   */
  function handleShortcut(e: KeyboardEvent) {
    if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'PageUp', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }

    switch (e.key) {
      case 'ArrowDown':
        return focusNextRow();
      case 'ArrowUp':
        return focusPreviousRow();
      case 'ArrowRight':
        return focusNextCol();
      case 'ArrowLeft':
        return focusPreviousCol();
      case 'PageUp':
        return focusPreviousRow(data.pageSize.value);
      case 'PageDown':
        return focusNextRow(data.pageSize.value);
      case 'Home':
        return focusFirstRow();
      case 'End':
        return focusLastRow();
      case 'Escape':
        return resetFocus();
      case 'h':
        data.isShortcutListOpen.value = !data.isShortcutListOpen.value;
        break;
      default:
    }
  }

  function resetFocus() {
    data.activeRow.value = 0;
    data.activeCol.value = 1;
    gridRef.value?.focus();
  }

  function focusFirstRow() {
    data.activeRow.value = 2;
    scrollToStartY();
    nextTick(() => focusActiveCell(false));
  }

  function focusLastRow() {
    data.activeRow.value = data.rowCount.value + 1;
    scrollToEndY();
    nextTick(() => focusActiveCell(false));
  }

  function focusNextRow(step = 1) {
    if (!lastRowReached.value) {
      data.activeRow.value = Math.min(data.activeRow.value + step, data.rowCount.value + 1);
      nextTick(() => focusActiveCell());
    }
  }

  function focusPreviousRow(step = 1) {
    if (!firstRowReached.value) {
      data.activeRow.value = Math.max(data.activeRow.value - step, 1);
      nextTick(() => focusActiveCell());
    }
  }

  function focusNextCol() {
    if (!lastColReached.value) {
      data.activeCol.value += 1;
      nextTick(() => focusActiveCell());
    } else {
      scrollToEndX();
    }
  }

  function focusPreviousCol() {
    if (!firstColReached.value) {
      data.activeCol.value -= 1;
      nextTick(() => focusActiveCell());
    } else {
      scrollToStartX();
    }
  }

  const shortcuts = computed<ShortcutGroup[]>(() => [
    {
      // Basic navigation.
      items: [
        { key: 'ArrowUp', label: 'Previous row', disabled: firstRowReached.value },
        { key: 'ArrowDown', label: 'Next row', disabled: lastRowReached.value },
        { key: 'ArrowLeft', label: 'Previous column', disabled: firstColReached.value },
        { key: 'ArrowRight', label: 'Next column', disabled: lastColReached.value },
      ],
    },
    {
      // Quick navigation.
      items: [
        { key: 'PageUp', label: quickNavLabel('up'), disabled: firstRowReached.value },
        { key: 'PageDown', label: quickNavLabel('down'), disabled: lastRowReached.value },
        { key: 'Home', label: 'First row', disabled: firstRowReached.value },
        { key: 'End', label: 'Last row', disabled: lastRowReached.value },
      ],
    },
  ]);

  const setGridFocus = () => {
    isGridFocused.value = true;
  };

  const unsetGridFocus = () => {
    isGridFocused.value = false;
  };

  onMounted(() => {
    gridRef.value?.addEventListener('focus', setGridFocus);
    gridRef.value?.addEventListener('blur', unsetGridFocus);
  });

  onBeforeUnmount(() => {
    gridRef.value?.removeEventListener('focus', setGridFocus);
    gridRef.value?.removeEventListener('blur', unsetGridFocus);
  });

  watchEffect(() => {});

  return {
    /** List of shortcuts. */
    shortcuts,
    /** Handles cell click. */
    handleCellClick,
    /** Handles keyboard shortcuts. */
    handleShortcut,

    /** Is focus set on the grid? */
    isGridFocused,
    /** Is the first row reached? */
    firstRowReached,
    /** Is the last row reached? */
    lastRowReached,
    /** Is the first row reached? */
    firstColReached,
    /** Is the last row reached? */
    lastColReached,
  };
}
