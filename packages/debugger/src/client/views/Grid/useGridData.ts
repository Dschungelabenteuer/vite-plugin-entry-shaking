import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import { mergeKeyVal } from '#utils';
import type { Column, GridProps, GridRowProps } from './Grid.types';

export function useGridData<Cols extends Record<string, Column>, Items extends any[]>(
  props: GridProps<Cols, Items>,
  gridRef: Ref<HTMLElement | null>,
) {
  const rows = computed(() => props.items);
  const rowCount = computed(() => props.items.length);
  const activeRow = ref<number>(0); // 0 when outside.

  const columns = computed(() => Object.entries(props.columns).map(mergeKeyVal));
  const colCount = computed(() => columns.value.length);
  const activeCol = ref<number>(1);

  const isShortcutListOpen = ref<boolean>(false);
  const pageSize = computed(() => {
    if (gridRef.value) {
      const { height } = gridRef.value.getBoundingClientRect();
      return Math.floor(height / props.minItemSize);
    }
    return 10;
  });

  const prepareRowProps = (item: GridRowProps<Items[number]>) => ({
    item,
    colCount: colCount.value,
  });

  return {
    /** Rows. */
    rows,
    /** Columns. */
    columns,

    /** Grid row count. */
    rowCount,
    /** Grid column count. */
    colCount,
    /** Grid page size. */
    pageSize,

    /** Active row index. */
    activeRow,
    /** Active col index. */
    activeCol,
    /** Is shortcut list open? */
    isShortcutListOpen,

    /** Used to set row props. */
    prepareRowProps,
  };
}
