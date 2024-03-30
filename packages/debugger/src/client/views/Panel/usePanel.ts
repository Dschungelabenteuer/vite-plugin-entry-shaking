import { ref } from 'vue';
import type { Panel } from './Panel.types';

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
