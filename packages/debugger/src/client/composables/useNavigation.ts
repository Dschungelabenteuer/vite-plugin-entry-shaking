import type { RouteRecordName } from 'vue-router';

import { computed } from 'vue';
import { store } from '../store';
import { routes } from '../routes';

export function useNavigation() {
  const links = computed(() =>
    routes
      .filter(({ meta }) => meta?.navItem)
      .map((route) => ({
        href: route.path,
        name: route.name,
        icon: route.meta?.icon,
        count: getLinkCount(route.name ?? ''),
      })),
  );

  return links;
}

function getLinkCount(routeName: RouteRecordName): number | undefined {
  if (!store) return 0;

  switch (routeName) {
    case 'Logs':
      return store.logs.length;
    case 'Entries':
      return store.entries.size;
    case 'Transforms':
      return store.transforms.length ?? 0;
    default:
      return undefined;
  }
}
