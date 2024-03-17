import { nextTick, onMounted, onUnmounted, watch } from 'vue';

import type { UseFloating, UseFloatingHandlers } from '@composable/useFloating';
import { useFloating } from '@composable/useFloating';
import { getFocusableChildren } from './useFocusTrap';

/**
 * Popover composable based on `useFloating`.
 * @param reference Reference element the popover is attached to (e.g. a button).
 * @param floatingEl Popover component that is attached to the reference element.
 * @param options Floating-ui options.
 */
export const usePopover: UseFloating = (reference, floating, options) => {
  const body = document.querySelector('body');
  const floatingUi = useFloating(reference, floating, {
    placement: 'bottom-end',
    ...options,
  });
  const handlers: UseFloatingHandlers = { click: floatingUi.toggle };

  const handleClickOutside = (event: Event) => {
    const pathStack = event.composedPath();
    if (
      reference.value &&
      floating.value &&
      !pathStack.includes(reference.value) &&
      !pathStack.includes('$el' in floating.value ? floating.value.$el : floating.value)
    ) {
      floatingUi.close();
    }
  };

  onMounted(() => {
    if (floating.value) {
      body!.addEventListener('click', handleClickOutside);
    }
  });

  onUnmounted(() => {
    body!.removeEventListener('click', handleClickOutside);
  });

  watch(floatingUi.isOpen, (isOpen) => {
    if (!isOpen || !floating.value) return;
    nextTick(() => {
      console.log(floating.value);
      console.log(getFocusableChildren(floating.value!));
    });
  });

  return { ...floatingUi, handlers };
};
