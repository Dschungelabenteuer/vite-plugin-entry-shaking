import type { SortDirection } from '#types';
import type { SortableColumn } from '@views/Browser/useBrowserData';
import type { useGridData } from './useGridData';
import type { useGridControls } from './useGridControls';
import type { useGridLayout } from './useGridLayout';

export type GridRowProps<T = any> = {
  /** Item data. */
  item: T;
  /** Column count. */
  colCount: number;
};

export type Column = {
  /** Column class. */
  class?: string;
  /** Column name. */
  label: string;
  /** Column width. */
  width: string;
  /** Column minimal width. */
  minWidth?: string;
  /** Is the column sortable? */
  sortable?: boolean;
  /** Is the column searchable? */
  searchable?: true;
  /** Ascending sorting label. */
  ascLabel?: string;
  /** Descending sorting label. */
  descLabel?: string;
};

export type KeyedColumn = Column & { key: string };

export type GridSortOptions<Cols = Record<string, Column>> = {
  /** Sort direction. */
  direction?: SortDirection;
  /** Sort parameters. */
  column?: keyof Cols;
};

export type GridProps<Cols extends Record<string, Column>, Items extends any[]> = {
  /** Grid key */
  id: string;
  /** Title of the grid view (mostly for a11y). */
  title: string;
  /** List of items. */
  items: Items;
  /** Class applied to all rows. */
  rowClass?: string | ((item: Items[number]) => string);
  /** Condensed display? (reduces overall spacing). */
  condensed?: boolean;
  /** List columns. */
  columns: Cols;
  /** Vue-virtual-grid's min-item size. */
  minItemSize: number;
  /** Sort parameters. */
  sort: GridSortOptions;
};

export type GridEvents = {
  /** Emitted when a column is sorted. */
  sort: [column: SortableColumn<any>];
  /** Emitted when trying to view details of a given row. */
  view: [itemPath: string];
};

export type GridSlots<Items extends any[]> = {
  /** Row content. */
  row(props: GridRowProps<Items[number]>): any;
};

export type GridSortFn = (column: KeyedColumn) => void;

export type GridHeaderProps = {
  /** Is the grid component ready? */
  ready: boolean;
  /** Grid columns */
  columns: KeyedColumn[];
  /** Sort parameters. */
  sort: GridSortOptions;
  /** CSS's `grid-template-cols` property value. */
  gridTemplateCols: string;
  /** Header height. */
  headerHeight: string;
};

export type UseGridDataReturn = ReturnType<typeof useGridData>;
export type UseGridControlsReturn = ReturnType<typeof useGridControls>;
export type UseGridLayoutReturn = ReturnType<typeof useGridLayout>;
export type RenderTracker = {
  row: number;
  resolve: (value: unknown) => void;
  reject: () => void;
};
