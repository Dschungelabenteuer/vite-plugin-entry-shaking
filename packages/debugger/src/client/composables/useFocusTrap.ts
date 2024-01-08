import type { Ref } from 'vue';
import { onMounted, onUnmounted } from 'vue';

/** Focusable elements' selector. */
const selector = [
  'button',
  '[href]',
  'input',
  'select',
  'textarea',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Focusable element's HTMLElement type. */
type FocusableElement =
  | HTMLButtonElement
  | HTMLAnchorElement
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | HTMLElement;

type ListenerParams = Parameters<Document['addEventListener']>;

/** Returns all focusable elements of a HTMLElement. */
export const getFocusableChildren = (element: HTMLElement) =>
  element.querySelectorAll<FocusableElement>(selector);

/**
 * Creates a focus trap on passed item.
 * @param element Reference element the focus is trapped into.
 */
export function useFocusTrap<Reference extends Ref<HTMLElement | null>>(element: Reference) {
  let firstFocusable: FocusableElement | null;
  let lastFocusable: FocusableElement | null;

  /** Handles tab keydown events. */
  const keyHandler = ((e: KeyboardEvent) => {
    if (!element.value) return clear();
    if (e.key !== 'Tab') return;

    const isFirstFocusableItem = document.activeElement === firstFocusable;
    const isLastFocusableItem = document.activeElement === lastFocusable;

    if (e.shiftKey && isFirstFocusableItem) {
      focusLast();
      e.preventDefault();
    } else if (!e.shiftKey && isLastFocusableItem) {
      focusFirst();
      e.preventDefault();
    }
  }) as EventListener;

  const listener: ListenerParams = ['keydown', keyHandler];
  const clear = () => element.value?.removeEventListener(...listener);
  const focusFirst = () => firstFocusable?.focus();
  const focusLast = () => lastFocusable?.focus();

  /** Updates focus trap's first and last focusable elements. */
  const refresh = () => {
    if (element.value) {
      const focusableEls = getFocusableChildren(element.value);
      if (!focusableEls.length) return;
      // eslint-disable-next-line prefer-destructuring
      firstFocusable = focusableEls[0];
      lastFocusable = focusableEls[focusableEls.length - 1];
    }
  };

  onMounted(() => {
    if (element.value) {
      refresh();
      element.value?.addEventListener(...listener);
      firstFocusable?.focus();
    }
  });

  onUnmounted(clear);

  return { clear, refresh, focusFirst, focusLast };
}
