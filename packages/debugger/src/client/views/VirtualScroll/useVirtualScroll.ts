import type { Ref } from 'vue';
import { ref, computed, onMounted } from 'vue';
import { useResizeObserver } from '@vueuse/core';

import type { ShortEmits } from '#uitypes';
import type { VirtualScrollViewEvents, VirtualScrollViewProps } from './VirtualScroll.types';

export const VIRTUAL_SCROLL_WRAPPER_CLASS = '__virtual-scroll-wrapper';

export function useVirtualScroll(
  containerRef: Ref<HTMLElement | null>,
  contentRef: Ref<HTMLElement | null>,
  props: VirtualScrollViewProps,
  emit: ShortEmits<VirtualScrollViewEvents>,
) {
  const scroll = ref(0);

  const axisSizeProp = computed(() => (props.axis === 'x' ? 'width' : 'height'));
  const axisTranslateProp = computed(() => (props.axis === 'x' ? 'translateX' : 'translateY'));
  const totalCount = computed(() => props.items.length);
  const contentSize = computed(() => totalCount.value * props.itemSize);
  const startIndex = computed(() =>
    Math.max(
      0,
      Math.floor(scroll.value / props.itemSize) -
        (props.padding ?? 0) -
        (props.prerenderedBeforeStart ?? 0),
    ),
  );
  const offset = computed(() => startIndex.value * props.itemSize);
  const nbVisible = computed(() => {
    const containerSize = containerRef.value?.getBoundingClientRect()[axisSizeProp.value] ?? 0;
    return (
      Math.min(
        totalCount.value - startIndex.value,
        Math.ceil(containerSize / props.itemSize) + 2 * (props.padding ?? 0),
      ) + (props.prerenderAfterEnd ?? 0)
    );
  });

  const visibleItems = computed(() =>
    props.items.slice(startIndex.value, startIndex.value + nbVisible.value),
  );

  const itemStyle = computed(
    () => ({ position: 'relative', height: `${props.itemSize}px` }) as const,
  );
  const containerStyle = computed(() => ({ overflow: 'auto' }) as const);
  const contentStyle = computed(() => getElementStyle(contentSize.value, 'hidden'));
  const wrapperStyle = computed(
    () => ({ transform: `${axisTranslateProp.value}(${offset.value}px)` }) as const,
  );

  const getElementStyle = (size: number, overflow: 'auto' | 'hidden') => ({
    [axisSizeProp.value]: `${size}px`,
    overflow,
  });

  const updateScrollPosition = () => {
    scroll.value = containerRef.value?.scrollTop ?? 0;
    emit('scroll');
  };

  const observeResize = () => {
    useResizeObserver(containerRef, (entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      emit('resize', { width, height });
    });
  };

  onMounted(() => {
    updateScrollPosition();
  });

  return {
    observeResize,
    updateScrollPosition,
    visibleItems,
    containerStyle,
    contentStyle,
    wrapperStyle,
    itemStyle,
  };
}
