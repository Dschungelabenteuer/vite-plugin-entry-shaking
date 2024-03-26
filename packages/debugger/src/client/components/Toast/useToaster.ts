/* eslint-disable no-plusplus */
import type { Ref } from 'vue';
import { computed, reactive, ref } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import type { Toast, ToastData, ToastOptions } from './Toast.types';
import type Toaster from './Toaster.vue';

export const TOASTER_CONTAINER_ID_VAR = 'toasterContainerId';
export const TOASTER_MAIN_CONTAINER_ID = 'toaster-container-main';
export const TOASTER_CONTAINER_CLASS = 'toaster-container';

const defaultToastOptions: ToastOptions = {
  autoclose: true,
  duration: 5000,
};

/**
 * Toaster composable.
 * @param toasterEl Toaster container element.
 */
export const useToaster = (toasterEl: Ref<InstanceType<typeof Toaster> | null>, maxToasts = 3) => {
  const idx = ref(0);
  const toastsMap = reactive<Map<number, Toast>>(new Map());
  const toasts = computed(() => Array.from(toastsMap.values()));
  const maxReached = computed(() => toastsMap.size >= maxToasts + 1); // +1 for the animation
  const toasterHeight = ref(0);

  useResizeObserver(toasterEl, (entries) => {
    const entry = entries[0];
    const { height } = entry.contentRect;
    const diff = height - toasterHeight.value;
    toasterHeight.value = height;
    if (diff > 0) {
      toasterEl.value!.$el.animate(
        [{ transform: `translateY(${diff}px)` }, { transform: 'translateY(0)' }],
        {
          duration: 600,
          easing: 'ease',
          fill: 'forwards',
        },
      );
    }
  });

  const add = (toast: ToastData, userOptions?: Partial<ToastOptions>) => {
    if (maxReached.value) clearOldest();
    const options: ToastOptions = { ...defaultToastOptions, ...(userOptions ?? {}) };
    const nth = idx.value++;
    const dismiss = () => toastsMap.delete(nth);
    toastsMap.set(nth, { ...toast, idx: nth, dismiss });

    if (options.autoclose) {
      setTimeout(() => {
        dismiss();
      }, options.duration);
    }

    return dismiss;
  };

  const clearOldest = () => {
    toastsMap.delete([...toastsMap.keys()][0]);
  };

  const clear = () => {
    toastsMap.clear();
  };

  const toasterClass = computed(() => [
    TOASTER_CONTAINER_CLASS,
    { 'max-reached': maxReached.value },
  ]);

  return {
    /** Adds a toast to toaster and returns a dismiss function. */
    add,
    /** Clear all toasts. */
    clear,
    /** List of active toasts. */
    toasts,
    /** Is the max amount of toasts reached? */
    maxReached,
    /** Toaster class. */
    class: toasterClass,
  };
};
