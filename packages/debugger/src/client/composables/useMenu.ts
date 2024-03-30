import type { Ref } from 'vue';
import { computed, nextTick, onMounted, ref, toValue } from 'vue';
import { getElement } from '#utils';

type MenuAxis = 'x' | 'y';

export function useMenu(
  axis: MenuAxis | Ref<MenuAxis>,
  items: Ref<(HTMLButtonElement | null)[]>,
  defaultActiveIndex = 0,
) {
  const index = ref(defaultActiveIndex);
  const itemsCount = computed(() => items.value?.length ?? 0);
  const lastIndex = computed(() => itemsCount.value - 1);
  const previousIndex = computed(() => (index.value === 0 ? lastIndex.value : index.value - 1));
  const nextIndex = computed(() => (index.value === lastIndex.value ? 0 : index.value + 1));

  const previousKey = computed(() => (toValue(axis) === 'x' ? 'ArrowLeft' : 'ArrowUp'));
  const nextKey = computed(() => (toValue(axis) === 'x' ? 'ArrowRight' : 'ArrowDown'));

  const navigationKeys = computed(() => [
    previousKey.value,
    nextKey.value,
    'PageUp',
    'PageDown',
    'Home',
    'End',
  ]);

  const setActiveIndex = (i: number) => {
    const item = items.value?.[i];
    if (!item) return;
    roveAll();
    unrove(item);
    index.value = i;
    return item;
  };

  const setTabIndex = (item: HTMLButtonElement | null, idx: number) =>
    item?.setAttribute('tabindex', String(idx));

  const rove = (item: HTMLButtonElement | null) => setTabIndex(item, -1);
  const unrove = (item: HTMLButtonElement | null) => setTabIndex(item, 0);
  const roveAll = () => items.value?.forEach(rove);

  const setNthItem = (i: number) => {
    setActiveIndex(i);
    focusActiveItem();
  };

  const setPreviousItem = () => setNthItem(previousIndex.value);
  const setNextItem = () => setNthItem(nextIndex.value);
  const setFirstItem = () => setNthItem(0);
  const setLastItem = () => setNthItem(lastIndex.value);
  const focusActiveItem = () => {
    const item = items.value?.[index.value];
    if (item) {
      nextTick(() => {
        getElement(item)?.focus();
      });
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (!navigationKeys.value.includes(event.key)) return;
    event.preventDefault();
    switch (event.key) {
      case previousKey.value:
        return setPreviousItem();
      case nextKey.value:
        return setNextItem();
      case 'PageUp':
      case 'Home':
        return setFirstItem();
      case 'PageDown':
      case 'End':
        return setLastItem();
      default:
        return undefined;
    }
  };

  const isActiveIndex = (i: number) => index.value === i;

  onMounted(() => {
    roveAll();
  });

  return { index, handleKeydown, setFirstItem, focusActiveItem, isActiveIndex, setNthItem };
}
