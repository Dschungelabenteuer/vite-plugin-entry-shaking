import type { Ref } from 'vue';
import { reactive, ref } from 'vue';

import type { ClassNameFn } from '@composables/useClassNames';
import type { Column, GridProps } from './Grid.types';
import { useGridControls } from './useGridControls';
import { useGridData } from './useGridData';
import { useGridLayout } from './useGridLayout';

export function useGrid<Cols extends Record<string, Column>, Items extends any[]>(
  props: GridProps<Cols, Items>,
  gridRef: Ref<HTMLElement | null>,
  $class: ClassNameFn,
) {
  /** Scrollable grid content element. */
  const gridScrollerRef = ref<HTMLElement | null>(null);

  const data = useGridData<Cols, Items>(props, gridRef);
  const layout = useGridLayout<Cols, Items>(props, gridRef, gridScrollerRef, data, $class);
  const controls = useGridControls<Cols, Items>(props, gridRef, data, layout);

  return {
    /** Grid data. */
    data: reactive(data),
    /** Grid controls. */
    controls: reactive(controls),
    /** Grid layout logic. */
    layout: reactive(layout),
  };
}
