/* eslint-disable no-return-assign */
import type { Ref } from 'vue';
import { ref } from 'vue';
import { useFloating as useFloatingUi, autoUpdate, flip, shift } from '@floating-ui/vue';

type CSSStyles = Record<string, any>;
export type UseFloatingHandlers = Partial<Record<UseFloatingHandler, () => void>>;
export type UseFloatingHandler = 'mouseenter' | 'mouseleave' | 'focus' | 'blur' | 'click';
export type UseFloating = <
  Reference extends Ref<HTMLButtonElement | null>,
  Floating extends Ref<any | null>,
>(
  reference: Reference,
  floatingEl: Floating,
) => {
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  styles: Ref<CSSStyles>;
  handlers?: UseFloatingHandlers;
};

/**
 * General-purpose `floating-ui` wrapper composable.
 * It exposed useful and self-explanatory control methods: `close`, `open` and `toggle`.
 * @param reference Reference element the floating element is attached to (e.g. a button).
 * @param floatingEl Floating element that is attached to the reference element.
 */
export const useFloating: UseFloating = (reference, floatingEl) => {
  const middleware = ref([flip(), shift()]);
  const isOpen = ref(false);
  const { floatingStyles: styles } = useFloatingUi(reference, floatingEl, {
    whileElementsMounted: autoUpdate,
    middleware,
  });

  const open = () => (isOpen.value = true);
  const close = () => (isOpen.value = false);
  const toggle = () => (isOpen.value = !isOpen.value);

  return { isOpen, open, close, toggle, styles };
};
