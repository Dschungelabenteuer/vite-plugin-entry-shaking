import { onMounted, onUnmounted } from 'vue';

import type { UseFloating, UseFloatingHandlers } from './useFloating';
import { useFloating } from './useFloating';

export const usePopover: UseFloating = (reference, floating) => {
  const body = document.querySelector('body');
  const floatingUi = useFloating(reference, floating);
  const handlers: UseFloatingHandlers = {
    click: floatingUi.toggle,
  };

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
