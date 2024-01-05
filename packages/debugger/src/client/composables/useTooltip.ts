import type { UseFloating, UseFloatingHandlers } from '@composable/useFloating';
import { useFloating } from '@composable/useFloating';

/**
 * Tooltip composable based on `useFloating`.
 * @param reference Reference element the tooltip is attached to (e.g. a button).
 * @param floatingEl Tooltip that is attached to the reference element.
 */
export const useTooltip: UseFloating = (reference, floating) => {
  const floatingUi = useFloating(reference, floating);
  const handlers: UseFloatingHandlers = {
    mouseenter: floatingUi.open,
    mouseleave: floatingUi.close,
    focus: floatingUi.open,
    blur: floatingUi.close,
  };

  return { ...floatingUi, handlers };
};
