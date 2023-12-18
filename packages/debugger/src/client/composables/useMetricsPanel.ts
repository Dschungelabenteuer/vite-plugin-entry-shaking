import type { Ref } from 'vue';
import { ref } from 'vue';

export type MetricsPanel = {
  closeBtnId: string;
  openBtnId: string;
  isOpen: Ref<boolean>;
  toggle: () => void;
};

export function useMetricsPanel(): MetricsPanel {
  const closeBtnId = 'close-metrics-panel';
  const openBtnId = 'open-metrics-panel';
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
