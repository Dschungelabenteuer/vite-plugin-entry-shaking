import type { Ref, ComputedRef } from 'vue';
import { computed, nextTick, defineComponent, h, onMounted, ref, watch, inject } from 'vue';
import { getElementBoundaries } from '#utils';
import { getFocusableChildren } from './useFocusTrap';

type RenderTracker = { row: number; resolve: (value: unknown) => void; reject: () => void };
let renderCallback: undefined | RenderTracker;

const getColIndex = (el: HTMLElement) => Number(el.getAttribute('aria-colindex')) ?? 0;

/**
 * Functional grid row component.
 * It basically makes sure the component used as a grid's row template
 * actually has as many children as there are columns in the grid, and
 * incrementally adds aria-colindex to all children for a11y purposes.
 * This is being handled here to keep row components simpler and more
 * consistent.
 */
export const Row = defineComponent({
  props: ['columns', 'rowIndex', 'activeRow', 'activeCol'],
  emits: ['cellClick'],
  setup(props, { slots, emit }) {
    const rowRef = ref<HTMLElement | undefined>();
    const gridRef = inject<Ref<HTMLElement | null>>('gridRef')!;

    const prepareRow = () => {
      const children = [...(rowRef.value?.children ?? [])];
      // Warn if number of children mismatch the number of columns.
      if (children.length !== Number(props.columns.length)) {
        console.warn(
          `[useDataGrid] Columns and children count mismatch.\n` +
            `The following element is expected to have ${props.columns.length} children ` +
            `but has actually ${rowRef.value?.children.length}. This may cause both ` +
            `styling and accessibility issues:\n`,
          rowRef.value,
        );
      }

      // Dynamically rove and add aria-colindex to children.
      (children as HTMLElement[]).forEach((child, index) => {
        rove(child);
        roveFocusableChildren(child);
        const className = props.columns[index].class;
        const colIndex = index + 1;
        child.removeEventListener('click', handleClick);
        child.setAttribute('aria-colindex', `${colIndex}`);
        child.classList.add(props.columns[index].class);
        if (className) child.classList.add(className);
        child.addEventListener('click', handleClick, { capture: true });
      });

      updateRow();
    };

    /** Called whenever a row is updated/replaced (e.g. content pool update). */
    const updateRow = () => {
      // Update row index.
      (rowRef.value as HTMLElement).setAttribute('aria-rowindex', `${props.rowIndex + 1}`);

      if (props.rowIndex + 1 === props.activeRow) {
        const child = rowRef.value?.querySelector(
          `[aria-colindex="${props.activeCol}"]`,
        ) as HTMLElement;

        if (child) {
          unrove(child);
          nextTick(() => {
            (child as HTMLElement).focus({
              preventScroll: true,
            });
          });
        }
      } else if (
        rowRef.value &&
        gridRef.value &&
        rowRef.value === document.activeElement?.parentElement
      ) {
        gridRef.value.focus();
      }

      // Set row as rendered if we were waiting for it.
      if (renderCallback && renderCallback.row === props.rowIndex + 1) {
        renderCallback.resolve(true);
        renderCallback = undefined;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const row = props.rowIndex + 1;
      const col = getColIndex(e.currentTarget as HTMLElement);
      emit('cellClick', row, col);
    };

    watch(
      () => props.rowIndex,
      () => updateRow(),
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
 * @param itemSize Size of a single grid item.
 * @param pageSize Number of rows to jump up/down when using PAGE keys.
 */
export function useGridNavigation(
  gridRef: Ref<HTMLElement | null>,
  colCount: ComputedRef<number>,
  rowCount: ComputedRef<number>,
  itemSize: number,
  pageSize: ComputedRef<number>,
) {
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
  /** Scrollable grid content boundaries.  */
  const gridScrollerBoundaries = ref<{ top: number; bottom: number }>({ top: 0, bottom: 0 });
  /** Scrollable grid content element. */
  const gridScrollerElement = ref<HTMLElement | null>(null);

  /** Is the first row reached? */
  const firstRowReached = computed(() => activeRow.value <= 1);
  /** Is the last row reached? */
  const lastRowReached = computed(() => activeRow.value >= rowCount.value + 1);
  /** Active row selector. */
  const activeRowSelector = computed(() => `[aria-rowindex="${activeRow.value}"]`);
  /** Is the first row reached? */
  const firstColReached = computed(() => activeCol.value <= 1);
  /** Is the last row reached? */
  const lastColReached = computed(() => activeCol.value >= colCount.value);
  /** Active column selector. */
  const activeColumnSelector = computed(() => `[aria-colindex="${activeCol.value}"]`);
  /** Scroll width. */
  const scrollWidth = computed(() => gridScrollerElement.value?.scrollWidth ?? 0);
  /** Scroll left. */
  const scrollLeft = computed(() => gridScrollerElement.value?.scrollLeft ?? 0);
  /** Scroll height. */
  const scrollHeight = computed(() => gridScrollerElement.value?.scrollHeight ?? 0);
  /** Scroll top. */
  const scrollTop = computed(() => gridScrollerElement.value?.scrollTop ?? 0);

  const scrollTo = (x: number, y: number) => gridScrollerElement.value?.scrollTo(x, y);
  const scrollToStartX = () => scrollTo(0, scrollTop.value);
  const scrollToEndX = () => scrollTo(scrollWidth.value, scrollTop.value);
  const scrollToStartY = () => scrollTo(scrollLeft.value, 0);
  const scrollToEndY = () => scrollTo(scrollLeft.value, scrollHeight.value);
  const scrollToActiveRow = () =>
    scrollTo(scrollLeft.value, activeRow.value * itemSize - (gridRef.value?.clientHeight ?? 0) / 2);

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

  /** Gets active cell. */
  async function getActiveCell(awaitRowRender = true) {
    const getCellSelector = () => `${activeRowSelector.value} ${activeColumnSelector.value}`;
    const getCell = () => gridRef.value?.querySelector<HTMLElement>(getCellSelector());
    renderCallback?.reject();
    await nextTick();

    return (
      getCell() ??
      (await new Promise((resolve, reject) => {
        if (awaitRowRender) return resolve(undefined);
        renderCallback = { resolve, reject, row: activeRow.value };
      })
        .then(() => getCell())
        .catch(() => undefined))
    );
  }

  /** Focuses active cell, or first focusable item of active cell if any. */
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
    if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'PageUp', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (e.key === 'ArrowDown') return focusNextRow();
    if (e.key === 'ArrowUp') return focusPreviousRow();
    if (e.key === 'ArrowRight') return focusNextCol();
    if (e.key === 'ArrowLeft') return focusPreviousCol();
    if (e.key === 'PageUp') return focusPreviousRow(pageSize.value);
    if (e.key === 'PageDown') return focusNextRow(pageSize.value);
    if (e.key === 'Home') return focusFirstRow();
    if (e.key === 'End') return focusLastRow();
    if (e.key === 'Escape') return resetFocus();
    if (e.key === 'h') isShortcutListOpen.value = !isShortcutListOpen.value;
  }

  function resetFocus() {
    activeRow.value = 0;
    activeCol.value = 1;
    gridRef.value?.focus();
  }

  function focusFirstRow() {
    activeRow.value = 2;
    scrollToStartY();
    nextTick(() => focusActiveCell(false));
  }

  function focusLastRow() {
    activeRow.value = rowCount.value + 1;
    scrollToEndY();
    nextTick(() => focusActiveCell(false));
  }

  function focusNextRow(step = 1) {
    if (!lastRowReached.value) {
      activeRow.value = Math.min(activeRow.value + step, rowCount.value + 1);
      nextTick(() => focusActiveCell());
    }
  }

  function focusPreviousRow(step = 1) {
    if (!firstRowReached.value) {
      activeRow.value = Math.max(activeRow.value - step, 1);
      nextTick(() => focusActiveCell());
    }
  }

  function focusNextCol() {
    if (!lastColReached.value) {
      activeCol.value += 1;
      nextTick(() => focusActiveCell());
    } else {
      scrollToEndX();
    }
  }

  function focusPreviousCol() {
    if (!firstColReached.value) {
      activeCol.value -= 1;
      nextTick(() => focusActiveCell());
    } else {
      scrollToStartX();
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
