/* eslint-disable no-return-assign */
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { UseFloatingOptions } from '@floating-ui/vue';
import { useFloating as useFloatingUi, autoUpdate, flip, shift, offset } from '@floating-ui/vue';

type CSSStyles = Record<string, any>;
export type UseFloatingHandlers = Partial<Record<UseFloatingHandler, () => void>>;
export type UseFloatingHandler = 'mouseenter' | 'mouseleave' | 'focus' | 'blur' | 'click';
export type UseFloating = <
  Reference extends Ref<HTMLButtonElement | null>,
  Floating extends Ref<any | null>,
>(
  reference: Reference,
  floatingEl: Floating,
  options?: UseFloatingOptions,
) => {
  /** Is the floating element shown? */
  isOpen: Ref<boolean>;
  /** Shows the floating element. */
  open: () => void;
  /** Hides the floating element. */
  close: () => void;
  /** Toggles floating element's visibility. */
  toggle: () => void;
  /** Floating styles. */
  styles: Ref<CSSStyles>;
  /** Floating handlers. */
  handlers?: UseFloatingHandlers;
};

/**
 * General-purpose `floating-ui` wrapper composable.
 * It exposed useful and self-explanatory control methods: `close`, `open` and `toggle`.
 * @param reference Reference element the floating element is attached to (e.g. a button).
 * @param floatingEl Floating element that is attached to the reference element.
 * @param options Floating-ui options.
 */
export const useFloating: UseFloating = (reference, floatingEl, options) => {
  const middleware = ref([flip(), shift(), offset({ crossAxis: -20 })]);
  const isOpen = ref(false);
  const { floatingStyles: styles } = useFloatingUi(reference, floatingEl, {
    whileElementsMounted: autoUpdate,
    middleware,
    ...options,
  });

  const open = () => (isOpen.value = true);
  const close = () => (isOpen.value = false);
  const toggle = () => (isOpen.value = !isOpen.value);

  return { isOpen, open, close, toggle, styles };
};
