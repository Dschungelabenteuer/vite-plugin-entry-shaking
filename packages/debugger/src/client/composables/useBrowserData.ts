import type { Ref, UnwrapRef } from 'vue';
import { computed, ref } from 'vue';

import type { SortDirection } from '#types';
import type { Column, KeyedColumn } from '@views/GridView.vue';

export interface BrowserData<T extends Ref<any[]> = Ref<any[]>> {
  title: string;
  columns: Record<string, Column>;
  filters: (item: T, filters: unknown) => boolean;
  source: T;
}

export type SortableColumn<T extends BrowserData> = keyof {
  [K in keyof T['columns'] as T['columns'][K]['sortable'] extends true ? K : never]: true;
};

export type SearchableColumn<T extends BrowserData> = keyof {
  [K in keyof T['columns'] as T['columns'][K]['searchable'] extends true ? K : never]: true;
};

/**
 * Composable used to abstract common logic used on browser views.
 * @param data Data of the browser view.
 */
export function useBrowserData<T extends BrowserData>(data: T) {
  const sortDirection = ref<SortDirection>('asc');
  const sortColumn = ref<SortableColumn<T> | undefined>(undefined);
  const search = ref<string | undefined>(undefined);
  const filters = ref<any>();

  const matched = computed<number>(() => items.value.length);
  const { columns, searchColumns } = getColumns(data);

  const items = computed(() => {
    const list: T['source'][] = data.source?.value.reduce(
      (out, item) => {
        const doesntMatchSearch =
          search?.value &&
          searchColumns.every((column) => {
            const value = item[column];
            return !value?.includes(search.value);
          });

        if (doesntMatchSearch) return out;
        const index = out.length + 1;
        return [...out, { ...item, index, id: item.id ?? index }];
      },
      [] as T['source'][],
    );

    return sortColumn.value
      ? list.sort((a, b) => {
          const from = a[sortColumn.value as keyof T['source']];
          const to = b[sortColumn.value as keyof T['source']];
          if (from < to) return sortDirection.value === 'asc' ? 1 : -1;
          if (from > to) return sortDirection.value === 'desc' ? 1 : -1;
          return 0;
        })
      : list;
  });

  const sort = computed(() => ({
    column: sortColumn.value,
    direction: sortDirection.value,
  }));

  const onSortChange = (column: SortableColumn<T>) => {
    sortColumn.value = column as UnwrapRef<SortableColumn<T>>;
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  };

  const onSearch = (q: string) => {
    const searched = q.trim();
    search.value = searched.length ? searched : undefined;
  };

  const onFilterChange = (filterList: T['filters']) => {
    filters.value = filterList;
  };

  const methods = {
    onSortChange,
    onSearch,
    onFilterChange,
  };

  return {
    title: data.title,
    columns,
    sort,
    search,
    items,
    filters,
    matched,
    methods,
  };
}

function getColumns<T extends BrowserData>(data: T) {
  const searchColumns: SearchableColumn<T>[] = [];
  const columns = Object.keys(data.columns).reduce((out, key) => {
    const column = data.columns[key];
    if (column.searchable) searchColumns?.push(key as SearchableColumn<T>);
    return [...out, { ...column, key }];
  }, [] as KeyedColumn[]);

  return { searchColumns, columns };
}
