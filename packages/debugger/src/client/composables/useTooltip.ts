import type { UseFloating, UseFloatingHandlers } from './useFloating';
import { useFloating } from './useFloating';

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
