import { onMounted, onUnmounted } from 'vue';

import type { UseFloating, UseFloatingHandlers } from '@composable/useFloating';
import { useFloating } from '@composable/useFloating';

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

  return { ...floatingUi, handlers };
};
