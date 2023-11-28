import type { Ref } from 'vue';
import { ref } from 'vue';

export type ExpectationsPanel = {
  closeBtnId: string;
  openBtnId: string;
  isOpen: Ref<boolean>;
  toggle: () => void;
};

export function useExpectationsPanel(): ExpectationsPanel {
  const closeBtnId = 'close-expectations-panel';
  const openBtnId = 'open-expectations-panel';
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
