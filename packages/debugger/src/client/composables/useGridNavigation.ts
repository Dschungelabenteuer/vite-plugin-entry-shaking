import type { ComputedRef, Ref } from 'vue';
import { computed, nextTick, onMounted, ref } from 'vue';
import { getFocusableChildren } from './useFocusTrap';

/**
 * Augments grid's keyboard navigation.
 * Active row and col indices are based on aria indices, which start at 1.
 * @param gridRef Reference to grid element.
 * @param colCount Total count of columns.
 * @param rowCount Total count of rows.
 */
export function useGridNavigation(
  gridRef: Ref<HTMLElement | undefined>,
  colCount: ComputedRef<number>,
  rowCount: ComputedRef<number>,
) {
  /** List of elements whose tabindices are changed based on focus. */
  let editedTabindexEls: HTMLElement[] = [];
  /** Index of active grid row. */
  const activeRow = ref<number>(0); // 0 when outside.
  /** Index of active grid column. */
  const activeCol = ref<number>(1);

  /** Is the first row reached? */
  const firstRowReached = computed(() => activeRow.value <= 1);
  /** Is the last row reached? */
  const lastRowReached = computed(() => activeRow.value >= rowCount.value);
  /** Is the first row reached? */
  const firstColReached = computed(() => activeCol.value <= 1);
  /** Is the last row reached? */
  const lastColReached = computed(() => activeCol.value >= colCount.value - 1);

  /** Whenever a line is mounted, let's add roving tabindex behaviour. */
  onMounted(() => {
    if (gridRef.value) {
      getFocusableChildren(gridRef.value).forEach((el) => {
        el.setAttribute('tabindex', '-1');
      });
    }
  });

  /** Resets roving tab index on elements whose tabindices were changed. */
  function resetRovingTabindex() {
    editedTabindexEls.forEach((el) => {
      el.setAttribute('tabindex', '-1');
    });
    editedTabindexEls = [];
  }

  /** Focuses active cell, or first focusable item of active cell if any. */
  function focusActiveCell() {
    resetRovingTabindex();
    const rowSelector = `[aria-rowindex="${activeRow.value}"]`;
    const colSelector = `[aria-colindex="${activeCol.value}"]`;
    const cellSelector = `${rowSelector} ${colSelector}`;
    const cell = gridRef.value?.querySelector<HTMLElement>(cellSelector);
    console.log('@@@', cellSelector, cell);
    if (!cell) return;

    const focusableChildren = getFocusableChildren(cell);
    const restoreTabindices = (el: HTMLElement) => {
      el.setAttribute('tabindex', '0');
      editedTabindexEls.push(el);
    };

    const target = focusableChildren.length
      ? // Reset native tabindex for cell's focusable elements…
        [...focusableChildren].map((el) => restoreTabindices(el))[0]
      : // …or the cell itself as part of the navigation.
        cell;

    console.log(target);

    nextTick(() => {
      target?.focus();
    });
  }

  /**
   * Handles keyboard shortcuts.
   * @param e Keyboard event.
   * @note I hate switches, we need pattern matching.
   */
  function handleShortcut(e: KeyboardEvent) {
    e.preventDefault();
    if (e.key === 'ArrowDown') return focusNextRow();
    if (e.key === 'ArrowUp') return focusPreviousRow();
    if (e.key === 'ArrowRight') return focusNextCol();
    if (e.key === 'ArrowLeft') return focusPreviousCol();
  }

  function focusNextRow() {
    console.log(lastRowReached.value, activeRow.value);
    if (!lastRowReached.value) {
      activeRow.value += 1;
      focusActiveCell();
    }
  }

  function focusPreviousRow() {
    if (!firstRowReached.value) {
      activeRow.value -= 1;
      focusActiveCell();
    }
  }

  function focusNextCol() {
    if (!lastColReached.value) {
      activeCol.value += 1;
      focusActiveCell();
    }
  }

  function focusPreviousCol() {
    if (!firstColReached.value) {
      activeCol.value -= 1;
      focusActiveCell();
    }
  }

  return {
    handleShortcut,
    activeRow,
    activeCol,
  };
}
