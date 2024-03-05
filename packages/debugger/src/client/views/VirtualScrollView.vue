<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import { VIRTUAL_SCROLL_WRAPPER_CLASS } from '@composable/useVirtualScroll';
import { useTransitionableVirtualScroll } from '@composable/useTransitionableVirtualScroll';

export interface VirtualScrollViewProps {
  /** Items of the virtual scroll. */
  items: any[];
  /** Size (px) of the virtual scroll container. */
  itemSize: number;
  /** Number of items to prerender before the first visible item. */
  prerenderedBeforeStart?: number;
  /** Number of items to prerender after the last visible item. */
  prerenderAfterEnd?: number;
  /** Optional delay before setting wrapper's overflow to auto (useful for transitions). */
  overflowDelay?: number;
  /** Padding of the visible nodes. */
  padding?: number;
  /** Virtual scroll axis */
  axis?: 'x' | 'y';
}

export type VirtualScrollViewEvents = {
  /** Emitted when virutal scroll container is resized. */
  resize: [{ width: number; height: number }];
  /** Emitted when the list is being scrolled. */
  scroll: [];
  /** Emitted when all visible items are rendered (after transition). */
  rendered: [];
};

const emit = defineEmits<VirtualScrollViewEvents>();
const props = withDefaults(defineProps<VirtualScrollViewProps>(), {
  prerenderedBeforeStart: 0,
  prerenderAfterEnd: 0,
  overflowDelay: 0,
  padding: 0,
  axis: 'y',
});

const slots = useSlots();
const containerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const beforeItemsCount = computed(() => (slots.before ? 1 : 0));
const {
  getItemDelay,
  onItemRendered,
  updateScrollPosition,
  listTransitionName,
  delayedOverflow,
  containerStyle,
  contentStyle,
  wrapperStyle,
  visibleItems,
  itemStyle,
} = useTransitionableVirtualScroll(containerRef, contentRef, props, emit, beforeItemsCount);
</script>

<template>
  <div
    ref="containerRef"
    :style="{ ...containerStyle, overflow: delayedOverflow, overflowY: 'auto' }"
    @scroll.passive="updateScrollPosition"
  >
    <slot name="before" />

    <div
      ref="contentRef"
      :style="contentStyle"
    >
      <div
        :class="VIRTUAL_SCROLL_WRAPPER_CLASS"
        :style="wrapperStyle"
      >
        <TransitionGroup
          tag="div"
          :name="listTransitionName"
          :on-after-enter="onItemRendered"
        >
          <div
            v-for="(item, i) in visibleItems"
            :key="i"
            :style="{ ...itemStyle, transitionDelay: getItemDelay(i) }"
          >
            <slot :item="item" />
          </div>
        </TransitionGroup>
      </div>
      <slot name="after" />
    </div>
  </div>
</template>

<style lang="scss">
::view-transition-old(virtual-scroll-container) {
  --slide-in-distance: 0.625rem;
  animation: 180ms ease slide-out-left forwards;
}
</style>
