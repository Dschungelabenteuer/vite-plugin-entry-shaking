import type { Ref } from 'vue';
import { defineComponent, h, inject, nextTick, onMounted, ref, watch } from 'vue';
import { rove, roveFocusableChildren, unrove } from './useGridControls';
import { renderCallback } from './useGridLayout';

const getColIndex = (el: HTMLElement) => Number(el.getAttribute('aria-colindex'));

/**
 * Functional grid row component.
 * It basically makes sure the component used as a grid's row template
 * actually has as many children as there are columns in the grid, and
 * incrementally adds aria-colindex to all children for a11y purposes.
 * This is being handled here to keep row components simpler and more
 * consistent.
 */
export const Row = defineComponent({
  props: {
    columns: { type: Array, required: true },
    rowIndex: { type: Number, required: true },
    activeRow: { type: Number, required: true },
    activeCol: { type: Number, required: true },
  },
  emits: ['cellClick'],
  setup(props, { slots, emit }) {
    const rowRef = ref<HTMLElement | undefined>();
    const gridRef = inject<Ref<HTMLElement | null>>('gridRef')!;

    const prepareRow = () => {
      const children = [...(rowRef.value?.children ?? [])];
      // Warn if number of children mismatch the number of columns.
      if (children.length !== props.columns.length) {
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
        const col = props.columns[index] as Record<string, any>;
        const className = col.class;
        const colIndex = index + 1;
        child.removeEventListener('click', handleClick);
        child.setAttribute('aria-colindex', `${colIndex}`);
        child.classList.add(className);
        if (className) child.classList.add(className);
        child.addEventListener('click', handleClick, { capture: true });
      });

      updateRow();
    };

    /** Called whenever a row is updated/replaced (e.g. content pool update). */
    const updateRow = () => {
      // Update row index.
      rowRef.value!.setAttribute('aria-rowindex', `${props.rowIndex + 1}`);

      if (props.rowIndex + 1 === props.activeRow) {
        const untypedChild = rowRef.value?.querySelector(`[aria-colindex="${props.activeCol}"]`);
        if (untypedChild) {
          const child = untypedChild as HTMLElement;
          unrove(child);
          nextTick(() => {
            child.focus({
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
      if (renderCallback.value && renderCallback.value.row === props.rowIndex + 1) {
        renderCallback.value.resolve(true);
        renderCallback.value = undefined;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const row = props.rowIndex + 1;
      const col = getColIndex(e.currentTarget as HTMLElement);
      emit('cellClick', row, col);
    };

    watch(
      () => props.rowIndex,
      () => {
        updateRow();
      },
      { flush: 'post' },
    );

    onMounted(() => {
      prepareRow();
    });

    return () => h('div', { class: 'grid__row', ref: rowRef }, slots.default?.());
  },
});
