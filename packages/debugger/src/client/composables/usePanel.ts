import type { Ref } from 'vue';
import { ref } from 'vue';

export type Panel = {
  /** ID for the close button element. */
  closeBtnId: string;
  /** ID for the open button element. */
  openBtnId: string;
  /** Is the panel expanded? */
  isOpen: Ref<boolean>;
  /** Toggles the panel on and off. */
  toggle: () => void;
};

export function usePanel(name: string): Panel {
  const closeBtnId = `close-${name}-panel`;
  const openBtnId = `open-${name}-panel`;
  const isOpen = ref(false);
  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  return {
    closeBtnId,
    openBtnId,
    isOpen,
    toggle,
  };
}
