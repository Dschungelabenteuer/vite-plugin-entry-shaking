import { computed } from 'vue';
import { store } from '../store';
import { routes } from '../routes';

export function useNavigation() {
  const links = computed(() =>
    routes
      .filter(({ props }) => props.navItem)
      .map((route) => ({
        href: route.path,
        name: route.name,
        icon: route.props.icon,
        count: getLinkCount(route.name),
      })),
  );

  return links;
}

function getLinkCount(routeName: string): number | undefined {
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
