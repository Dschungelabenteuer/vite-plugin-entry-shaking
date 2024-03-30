import type { ComputedRef, Ref } from 'vue';
import { computed, ref, toValue } from 'vue';

import type { ShortEmits } from '#uitypes';
import { useViewTransition } from '@composables/useViewTransition';
import type { VirtualScrollEvents, VirtualScrollProps } from './VirtualScroll.types';
import { useVirtualScroll } from './useVirtualScroll';

export function useTransitionableVirtualScroll(
  containerRef: Ref<HTMLElement | null>,
  contentRef: Ref<HTMLElement | null>,
  props: VirtualScrollProps,
  emit: ShortEmits<VirtualScrollEvents>,
  beforeItemsCount: number | ComputedRef<number> = 0,
) {
  // Base virtual scroll behaviour.
  const {
    observeResize,
    updateScrollPosition,
    containerStyle,
    contentStyle,
    wrapperStyle,
    visibleItems,
    itemStyle,
  } = useVirtualScroll(containerRef, contentRef, props, emit);

  // Add transition to virtual scroll container.
  useViewTransition({
    names: { 'virtual-scroll-container': containerRef },
    lazy: ['virtual-scroll-container'],
  });

  /** Amount of rendered items. */
  const renderedItemsCount = ref(0);

  /** Delay between each item render. */
  const ITEM_DELAY = 11;

  /**
   * CSS overflow property to be applied to the container.
   * It allows to temporarily hide overflow while the enter transition is running.
   * It should eventually be set to 'auto' after all items have been rendered.
   */
  const delayedOverflow = ref<string>('hidden');

  /**
   * Name of the transition to be applied to the list of visible items.
   * It should be set to undefined after all items have been rendered so that
   * pre-rendered items don't trigger the transition again (pre-rendered items
   * are theorically not visible).
   */
  const listTransitionName = ref<string | undefined>('list');

  /** Total rendered items. */
  const totalDisplayedItems = computed(
    () =>
      visibleItems.value.length +
      (props.prerenderedBeforeStart ?? 0) +
      (props.prerenderAfterEnd ?? 0),
  );

  const getItemDelay = (index: number) => `${(index + toValue(beforeItemsCount)) * ITEM_DELAY}ms`;

  const onItemRendered = () => {
    renderedItemsCount.value += 1;

    if (renderedItemsCount.value === totalDisplayedItems.value) {
      listTransitionName.value = undefined;
      delayedOverflow.value = 'auto';
      observeResize();
    }
  };

  return {
    getItemDelay,
    onItemRendered,
    observeResize,
    updateScrollPosition,
    listTransitionName,
    delayedOverflow,
    containerStyle,
    contentStyle,
    wrapperStyle,
    visibleItems,
    itemStyle,
  };
}
