import type { ComputedRef, Ref } from 'vue';
import { computed, nextTick, defineComponent, h, onMounted, ref, watch } from 'vue';
import { getElementBoundaries } from '#utils';
import { useActiveElement } from '@vueuse/core';
import { getFocusableChildren } from './useFocusTrap';

/**
 * Functional grid row component.
 * It basically makes sure the component used as a grid's row template
 * actually has as many children as there are columns in the grid, and
 * incrementally adds aria-colindex to all children for a11y purposes.
 * This is being handled here to keep row components simpler and more
 * consistent.
 */
export const Row = defineComponent({
  props: ['columns', 'rowIndex'],
  emits: ['cellClick'],
  setup(props, { slots, emit }) {
    const rowRef = ref<HTMLElement | undefined>();

    const prepareRow = () => {
      const children = [...(rowRef.value?.children ?? [])];
      // Warn if number of children mismatch the number of columns.
      if (children.length !== Number(props.columns.length)) {
        console.warn(
          `[Grid warn] Columns and children count mismatch.\n` +
            `The following element is expected to have ${props.columns.length} children ` +
            `but has actually ${rowRef.value?.children.length}. This may cause both ` +
            `styling and accessibility issues:\n`,
          rowRef.value,
        );
      }

      // Dynamically rove and add aria-colindex to children.
      (children as HTMLElement[]).forEach((child, index) => {
        roveFocusableChildren(child);
        const className = props.columns[index].class;
        child.removeEventListener('click', handleClick);
        child.setAttribute('aria-colindex', `${index + 1}`);
        child.setAttribute('data-rowindex', `${props.rowIndex + 2}`);
        child.classList.add(props.columns[index].class);
        if (className) child.classList.add(className);
        child.addEventListener('click', handleClick, { capture: true });
      });
    };

    const handleClick = (e: MouseEvent) => {
      const row = props.rowIndex + 2;
      const col = Number((e.currentTarget as HTMLElement).getAttribute('aria-colindex')) ?? 0;
      console.log('@@click', row, col);
      emit('cellClick', row, col);
    };

    watch(
      () => props.rowIndex,
      () => prepareRow(),
      { flush: 'post' },
    );

    onMounted(() => {
      prepareRow();
    });

    return () => h('div', { class: 'grid__row', ref: rowRef }, slots.default?.());
  },
});

/** I like to rove it, rove it. */
const rove = (el: HTMLElement) => el.setAttribute('tabindex', '-1');
/** So much that I'd do it on every single focusable element. */
export const roveFocusableChildren = (el: HTMLElement) => getFocusableChildren(el).forEach(rove);
/** Nevermind I don't like it that much… */
const unrove = (el: HTMLElement) => el.setAttribute('tabindex', '0');

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
  /**
   * This hack is required because when scrolling pretty fast or long-pressing arrow keys,
   * focused element may be flushed by vue-virtual-scroller's own logic, therefore giving
   * away the focus to the body element. Fine-grained control over that behaviour would
   * probably be much less performant and maintainable.
   */
  const activeElement = useActiveElement();
  watch(activeElement, (el) => {
    if (el?.nodeName === 'BODY') {
      focusActiveCell();
    }

    isGridFocused.value = el === gridRef.value;
  });

  /** List of elements whose tabindices are changed based on focus. */
  let editedTabindexEls: HTMLElement[] = [];
  /** Index of active grid row. */
  const activeRow = ref<number>(0); // 0 when outside.
  /** Index of active grid column. */
  const activeCol = ref<number>(1);
  /** Is focus set on the grid? */
  const isGridFocused = ref<boolean>(false);
  /** Is shortcut list open? */
  const isShortcutListOpen = ref<boolean>(false);

  /** Is the first row reached? */
  const firstRowReached = computed(() => activeRow.value <= 1);
  /** Is the last row reached? */
  const lastRowReached = computed(() => activeRow.value >= rowCount.value + 1);
  /** Is the first row reached? */
  const firstColReached = computed(() => activeCol.value <= 1);
  /** Is the last row reached? */
  const lastColReached = computed(() => activeCol.value >= colCount.value);

  const gridScrollerBoundaries = ref<{ top: number; bottom: number }>({ top: 0, bottom: 0 });
  const gridScrollerElement = ref<HTMLElement | null>(null);

  /** Whenever a line is mounted, let's add roving tabindex behaviour. */
  onMounted(() => {
    if (!gridRef.value) return;
    gridScrollerElement.value = gridRef.value.querySelector('.vue-recycle-scroller');
    gridScrollerBoundaries.value = getElementBoundaries(gridScrollerElement.value ?? gridRef.value);
    roveFocusableChildren(gridRef.value);
  });

  /** Resets roving tab index on elements whose tabindices were changed. */
  function resetRovingTabindex() {
    editedTabindexEls.forEach(rove);
    editedTabindexEls = [];
  }

  /** Focuses active cell, or first focusable item of active cell if any. */
  function focusActiveCell(autoscroll = true) {
    resetRovingTabindex();
    const rowSelector = `[aria-rowindex="${activeRow.value}"]`;
    const colSelector = `[aria-colindex="${activeCol.value}"]`;
    const cellSelector = `${rowSelector} ${colSelector}`;
    const cell = gridRef.value?.querySelector<HTMLElement>(cellSelector);
    if (!cell) return;

    const focusableChildren = getFocusableChildren(cell);
    const restoreTabindices = (el: HTMLElement) => {
      unrove(el);
      editedTabindexEls.push(el);
      return el;
    };

    const target = focusableChildren.length
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
      } else if (top - gridScrollerBoundaries.value.top <= 2 * rowSize) {
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
    activeRow.value = row;
    activeCol.value = col;
    focusActiveCell(false);
  }

  /**
   * Handles keyboard shortcuts.
   * @param e Keyboard event.
   * @note I hate switches, we need pattern matching.
   */
  function handleShortcut(e: KeyboardEvent) {
    if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (e.key === 'ArrowDown') return focusNextRow();
    if (e.key === 'ArrowUp') return focusPreviousRow();
    if (e.key === 'ArrowRight') return focusNextCol();
    if (e.key === 'ArrowLeft') return focusPreviousCol();
    if (e.key === 'Escape') return resetFocus();
    if (e.key === 'h') isShortcutListOpen.value = !isShortcutListOpen.value;
  }

  function resetFocus() {
    activeRow.value = 0;
    activeCol.value = 1;
    gridRef.value?.focus();
  }

  function focusNextRow() {
    if (!lastRowReached.value) {
      activeRow.value += 1;
      nextTick(() => focusActiveCell());
    } else {
      gridRef.value?.scrollTo(gridRef.value.scrollLeft, gridRef.value.scrollHeight);
    }
  }

  function focusPreviousRow() {
    if (!firstRowReached.value) {
      activeRow.value -= 1;
      nextTick(() => focusActiveCell());
    } else {
      gridRef.value?.scrollTo(gridRef.value.scrollLeft, 0);
    }
  }

  function focusNextCol() {
    if (!lastColReached.value) {
      activeCol.value += 1;
      nextTick(() => focusActiveCell());
    } else {
      gridRef.value?.scrollTo(gridRef.value.scrollWidth, gridRef.value.scrollTop);
    }
  }

  function focusPreviousCol() {
    if (!firstColReached.value) {
      activeCol.value -= 1;
      nextTick(() => focusActiveCell());
    } else {
      gridRef.value?.scrollTo(0, gridRef.value.scrollTop);
    }
  }

  return {
    /** Handles cell click. */
    handleCellClick,
    /** Handles keyboard shortcuts. */
    handleShortcut,

    /** Active row index. */
    activeRow,
    /** Active col index. */
    activeCol,

    /** Is focus set on the grid? */
    isGridFocused,
    /** Is shortcut list open? */
    isShortcutListOpen,

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
