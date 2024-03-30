<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import { VIRTUAL_SCROLL_WRAPPER_CLASS } from './useVirtualScroll';
import { useTransitionableVirtualScroll } from './useTransitionableVirtualScroll';
import type {
  VirtualScrollEvents,
  VirtualScrollProps,
  VirtualScrollSlots,
} from './VirtualScroll.types';

const emit = defineEmits<VirtualScrollEvents>();
const slots = defineSlots<VirtualScrollSlots>();
const props = withDefaults(defineProps<VirtualScrollProps>(), {
  prerenderedBeforeStart: 0,
  prerenderAfterEnd: 0,
  overflowDelay: 0,
  padding: 0,
  axis: 'y',
});

const slotList = useSlots();
const containerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const beforeItemsCount = computed(() => (slotList.before ? 1 : 0));
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
