import type { Ref } from 'vue';
import { computed, onMounted, ref } from 'vue';

export type DropdownMenuItem = {
  label: string;
  icon?: string;
  children?: DropdownMenuItem[];
  action?: (...args: any[]) => void;
};

const NAVIGATION_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];

export function useDropdownMenu(emit: any, items: Ref<HTMLButtonElement[] | null>) {
  const index = ref(-1);
  const itemsCount = computed(() => items.value?.length ?? 0);
  const lastIndex = computed(() => itemsCount.value - 1);
  const previousIndex = computed(() => (index.value === 0 ? lastIndex.value : index.value - 1));
  const nextIndex = computed(() => (index.value === lastIndex.value ? 0 : index.value + 1));

  const setActiveIndex = (i: number) => {
    const item = items.value?.[i];
    if (!item) return;
    roveAll();
    unrove(item);
    index.value = i;
    return item;
  };

  const setTabIndex = (item: HTMLButtonElement, idx: number) =>
    item.setAttribute('tabindex', String(idx));

  const rove = (item: HTMLButtonElement) => setTabIndex(item, -1);
  const unrove = (item: HTMLButtonElement) => setTabIndex(item, 0);
  const roveAll = () => items.value?.forEach(rove);

  const focusNthItem = (i: number) => {
    const item = setActiveIndex(i);
    item?.focus();
  };

  const focusPreviousItem = () => focusNthItem(previousIndex.value);
  const focusNextItem = () => focusNthItem(nextIndex.value);
  const focusFirstItem = () => focusNthItem(0);
  const focusLastItem = () => focusNthItem(lastIndex.value);

  const handleKeyPress = (event: KeyboardEvent) => {
    if (!NAVIGATION_KEYS.includes(event.key) === false) return;
    event.preventDefault();
    switch (event.key) {
      case 'ArrowUp':
        return focusPreviousItem();
      case 'ArrowDown':
        return focusNextItem();
      case 'PageUp':
      case 'Home':
        return focusFirstItem();
      case 'PageDown':
      case 'End':
        return focusLastItem();
      case 'Escape':
        return emit('close');
      default:
        return undefined;
    }
  };

  onMounted(() => {
    roveAll();
  });

  return { handleKeyPress };
}
