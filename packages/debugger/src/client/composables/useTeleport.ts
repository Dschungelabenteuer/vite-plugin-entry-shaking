import type { Ref } from 'vue';
import { computed, inject } from 'vue';
import { DIALOG_CONTAINER_ID_VAR } from '@components/Dialog/useDialog';
import { FLOATING_CONTAINER_ID_VAR } from './useFloating';

export function useTeleport(what: 'floating' | 'dialog' = 'floating') {
  const floatingContainerId = inject<string>(FLOATING_CONTAINER_ID_VAR)!;
  const dialogContainerId = inject<string>(DIALOG_CONTAINER_ID_VAR)!;
  const enableTeleports = inject<Ref<boolean>>('enableTeleports')!;

  const disabled = computed(() => enableTeleports.value !== true);
  const to = computed(() => {
    if (disabled.value) return 'body';
    return what === 'floating' ? `#${floatingContainerId}` : `#${dialogContainerId}`;
  });
  return {
    disabled,
    to,
  };
}
