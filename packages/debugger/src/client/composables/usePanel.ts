import type { Ref } from 'vue';
import { ref } from 'vue';

export type Panel = {
  closeBtnId: string;
  openBtnId: string;
  isOpen: Ref<boolean>;
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
