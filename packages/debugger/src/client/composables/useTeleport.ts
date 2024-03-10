import type { Ref } from 'vue';
import { computed, inject } from 'vue';
import { FLOATING_CONTAINER_ID_VAR } from './useFloating';

export function useTeleport() {
  const floatingContainerId = inject<string>(FLOATING_CONTAINER_ID_VAR)!;
  const enableTeleports = inject<Ref<boolean>>('enableTeleports')!;

  const disabled = computed(() => enableTeleports.value !== true);
  const to = computed(() => (disabled.value ? 'body' : `#${floatingContainerId}`));
  return {
    disabled,
    to,
  };
}
