import type { Ref } from 'vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { ShortEmits } from '#uitypes';
import { useFocusTrap } from '@composables/useFocusTrap';
import { useTeleport } from '@composables/useTeleport';
import type { DialogEvents, DialogProps } from './Dialog.types';

export const DIALOG_CONTAINER_ID_VAR = 'dialogContainerId';
export const DIALOG_MAIN_CONTAINER_ID = 'dialog-container-main';
export const DIALOG_CONTAINER_CLASS = 'dialog-container';

/**
 * Dialog composable.
 * @param props Dialog props.
 * @param emit Dialog events emitter.
 * @param element Dialog content template ref.
 */
export function useDialog(
  props: DialogProps,
  emit: ShortEmits<DialogEvents>,
  element: Ref<HTMLDialogElement | null>,
) {
  const trap = useFocusTrap(element);
  const timeout = ref<ReturnType<typeof setTimeout>>();
  const teleport = useTeleport('dialog');

  /** Closes the dialog. */
  const close = () => {
    element.value?.close();
  };

  /** Triggered when dialog is clicked. */
  const handleClick = (event: Event) => {
    const [topTarget] = event.composedPath();
    if (topTarget === element.value) close();
  };

  /** Triggered when opening the dialog. */
  const handleOpen = () => {
    // Clear any existing close animation's timeout.
    if (timeout.value) clearTimeout(timeout.value);
    // Refresh focus trap in case dialog content changed.
    trap.refresh();
  };

  /** Triggered when closing the dialog. */
  const handleClose = () => {
    const animationCustomProp = '--transition-duration-short';
    const computedStyle = getComputedStyle(element.value!);
    const duration = computedStyle.getPropertyValue(animationCustomProp);
    const delay = duration.endsWith('ms')
      ? Number(duration.slice(0, -2))
      : Number(duration.slice(0, -1)) * 1000;
    // Wait for the closing animation to finish before emitting the close event.
    timeout.value = setTimeout(() => emit('close'), delay);
  };

  const dialogTransitionName = computed(() => `dialog-${props.id}-transition`);
  const backdropTransitionName = computed(() => `dialog-backdrop-${props.id}-transition`);
  const isOpen = ref(element?.value?.open ?? false);

  let observer: MutationObserver;
  onMounted(() => {
    observer = new MutationObserver(() => {
      isOpen.value = element.value?.open ?? false;
    });

    observer.observe(element.value!, {
      attributes: true,
      attributeFilter: ['open'],
    });
  });

  onUnmounted(() => observer && observer.disconnect());

  return {
    trap,
    close,
    handleClick,
    handleOpen,
    handleClose,
    dialogTransitionName,
    backdropTransitionName,
    teleport,
    isOpen,
  };
}
