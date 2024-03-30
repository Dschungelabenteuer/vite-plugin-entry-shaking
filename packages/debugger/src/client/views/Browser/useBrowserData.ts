import type { Ref, UnwrapRef } from 'vue';
import { computed, ref } from 'vue';

import type { SortDirection } from '#types';
import type { Column } from '@views/Grid/Grid.types';

export interface BrowserData<Filters = any> {
  /** ID of the browser. */
  id: string;
  /** Title of the browser. */
  title: string;
  /** Columns. */
  columns: Record<string, Column>;
  /** Rows. */
  source: Ref<any[]>;
  /** Filter function. */
  filterFn: (item: any, filters: Filters) => boolean;
  /** Default filters. */
  defaultFilters: Filters;
}

/** Type utility that returns keys of columns that may be sorted. */
export type SortableColumn<T extends BrowserData> = keyof {
  [K in keyof T['columns'] as T['columns'][K]['sortable'] extends true ? K : never]: true;
};

/** Type utility that returns keys of columns that may be searched through. */
export type SearchableColumn<T extends BrowserData> = keyof {
  [K in keyof T['columns'] as T['columns'][K]['searchable'] extends true ? K : never]: true;
};

/**
 * Composable used to abstract common logic used on browser views.
 * @param data Data of the browser view.
 */
export function useBrowserData<
  const T extends BrowserData,
  Source = UnwrapRef<T['source']>,
  Item = Source extends Array<infer I> ? I : never,
>(data: T) {
  const sortDirection = ref<SortDirection>('asc');
  const sortColumn = ref<SortableColumn<T> | undefined>(undefined);
  const search = ref<string | undefined>(undefined);
  const filters = ref<T['defaultFilters']>(data.defaultFilters);
  const matched = computed<number>(() => items.value.length);
  const searchColumns = getSearchableColumns(data.columns);
  const items = computed<Item[]>(() => {
    const list: Item[] = data.source?.value.reduce((out, item) => {
      if (!matchesSearch(item) || !matchesFilters(item)) return out;
      const index = out.length + 1;
      return [...out, { ...item, index, id: item.id ?? index }];
    }, []);

    return sortColumn.value ? applySort(list) : list;
  });

  const applySort = (list: Item[]) =>
    list.sort((a, b) => {
      const from = a[sortColumn.value as keyof Item];
      const to = b[sortColumn.value as keyof Item];
      if (from < to) return sortDirection.value === 'asc' ? 1 : -1;
      if (from > to) return sortDirection.value === 'desc' ? 1 : -1;
      return 0;
    });

  const sort = computed(() => ({
    column: sortColumn.value,
    direction: sortDirection.value,
  }));

  const matchesSearch = (item: Item) =>
    !(
      search?.value &&
      searchColumns.every((column) => {
        const value = String(item[column as keyof Item]).toLocaleLowerCase();
        return !value?.includes(search.value?.toLocaleLowerCase() ?? '');
      })
    );

  const matchesFilters = (item: Item) => !filters?.value || data.filterFn(item, filters.value);

  const onSortChange = (column: SortableColumn<T>) => {
    sortColumn.value = column as UnwrapRef<SortableColumn<T>>;
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  };

  const onSearch = (q: string) => {
    const searched = q.trim();
    search.value = searched.length ? searched : undefined;
  };

  const methods = {
    onSortChange,
    onSearch,
  };

  return {
    /** ID of the browser. */
    id: data.id,
    /** Title of the browser. */
    title: data.title,
    /** Columns. */
    columns: data.columns as T['columns'],
    /** Active sort parameters. */
    sort,
    /** Active search query string. */
    search,
    /** Filtered and sorted items. */
    items,
    /** Active filters model. */
    filters,
    /** Matched items count (after filter and search.) */
    matched,
    /** Browser event methods. */
    methods,
  };
}

function getSearchableColumns(cols: Record<string, Column>) {
  return Object.keys(cols).filter((col) => cols[col].searchable);
}
