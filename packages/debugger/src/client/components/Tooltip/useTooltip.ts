import type { UseFloating, UseFloatingHandlers } from '@composables/useFloating';
import { useFloating } from '@composables/useFloating';

/**
 * Tooltip composable based on `useFloating`.
 * @param reference Reference element the tooltip is attached to (e.g. a button).
 * @param floatingEl Tooltip that is attached to the reference element.
 * @param options Floating-ui options.
 */
export const useTooltip: UseFloating = (reference, floatingEl, options) => {
  const floating = useFloating(reference, floatingEl, {
    placement: 'top',
    ...options,
  });
  const handlers: UseFloatingHandlers = {
    mouseenter: floating.open,
    mouseleave: floating.close,
    focus: floating.open,
    blur: floating.close,
  };

  return { ...floating, handlers };
};
