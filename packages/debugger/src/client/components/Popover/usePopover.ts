import { nextTick, onMounted, onUnmounted, watch } from 'vue';

import type { UseFloating, UseFloatingHandlers } from '@composables/useFloating';
import { useFloating } from '@composables/useFloating';
import { getFocusableChildren } from '@composables/useFocusTrap';

/**
 * Popover composable based on `useFloating`.
 * @param reference Reference element the popover is attached to (e.g. a button).
 * @param floatingEl Popover component that is attached to the reference element.
 * @param options Floating-ui options.
 */
export const usePopover: UseFloating = (reference, floatingEl, options) => {
  const body = document.querySelector('body');
  const floating = useFloating(reference, floatingEl, {
    placement: 'bottom-end',
    ...options,
  });
  const handlers: UseFloatingHandlers = { click: floating.toggle };

  const handleClickOutside = (event: Event) => {
    const pathStack = event.composedPath();
    if (
      reference.value &&
      floatingEl.value &&
      !pathStack.includes(reference.value) &&
      !pathStack.includes('$el' in floatingEl.value ? floatingEl.value.$el : floatingEl.value)
    ) {
      floating.close();
    }
  };

  onMounted(() => {
    if (floatingEl.value) {
      body!.addEventListener('click', handleClickOutside);
    }
  });

  onUnmounted(() => {
    body!.removeEventListener('click', handleClickOutside);
  });

  watch(floating.isOpen, (isOpen) => {
    if (!isOpen || !floatingEl.value) return;
    nextTick(() => {
      getFocusableChildren(floatingEl.value)?.[0]?.focus();
    });
  });

  return { ...floating, handlers };
};
