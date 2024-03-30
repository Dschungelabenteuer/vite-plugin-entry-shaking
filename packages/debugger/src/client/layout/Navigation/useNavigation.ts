import type { RouteRecordName } from 'vue-router';
import { computed } from 'vue';

import { store } from '#store';
import { routes } from '../../routes';

/** Returns navigation props based on application routes. */
export function useNavigation() {
  const links = computed(() =>
    routes
      .filter(({ meta }) => meta?.navItem)
      .map((route) => ({
        href: route.path,
        name: route.name,
        icon: route.meta?.icon as string,
        count: getLinkCount(route.name ?? ''),
      })),
  );

  return links;
}

/**
 * Returns route-specific total item count (or `undefined` if irrelevant).
 * @param routeName Name of the route as specified through route's config.
 */
function getLinkCount(routeName: RouteRecordName): number | undefined {
  if (!store) return 0;

  switch (routeName) {
    case 'Logs':
      return store.logs.length;
    case 'Entries':
      return store.entries.size ?? 0;
    case 'Transforms':
      return store.transforms.size ?? 0;
    default:
      return undefined;
  }
}
