import { computed, inject } from 'vue';
import { routes } from '../routes';
import type { ChannelStore } from '..';

export function useNavigation() {
  const store = inject<ChannelStore>('store')!;
  const links = computed(() =>
    routes
      .filter(({ props }) => props.navItem)
      .map((route) => ({
        href: route.path,
        name: route.name,
        icon: route.props.icon,
        count: getLinkCount(route.name, store),
      })),
  );

  return links;
}

function getLinkCount(routeName: string, store: ChannelStore): number | undefined {
  switch (routeName) {
    case 'Targets':
      return store.targets.size;
    case 'Expectations':
      return store.expectations.length;
    case 'Logs':
      return store.logs.length;
    default:
      return undefined;
  }
}
