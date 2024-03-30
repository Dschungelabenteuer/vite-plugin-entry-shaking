import type { ComponentPublicInstance, Ref } from 'vue';
import { inject, onBeforeUnmount, onMounted } from 'vue';

import { getElement } from '#utils';

type AugmentedViewTransition = ViewTransition & { captured: Promise<void> };
type TransitionableElement = Ref<HTMLElement | null> | Ref<ComponentPublicInstance>;
type ViewTransitionName = string;
type ViewTransitionNameItem = Map<number, TransitionableElement>;

export interface UseViewTransitionOptions {
  /** List of `view transition-name`s, and the HTMLElement they refer to. */
  names?: Record<ViewTransitionName, TransitionableElement>;
  /**
   * List of lazy `view-transition-names`, those will be added to relevant
   * element onlys when `doTransition is called`
   */
  lazy?: ViewTransitionName[];
}

const lazyTransitions = new Set<ViewTransitionName>();
const allTransitions = new Map<ViewTransitionName, ViewTransitionNameItem>();

export function useViewTransition(options: UseViewTransitionOptions) {
  const localTransitions = new Map<ViewTransitionName, ViewTransitionNameItem>();
  const depth = inject<number>('depth')!;

  const setTransitionName = (name: ViewTransitionName, element: TransitionableElement) => {
    const el = getElement(element);
    if (!el) return;
    if (!allTransitions.has(name)) allTransitions.set(name, new Map());
    if (!localTransitions.has(name)) localTransitions.set(name, new Map());
    allTransitions.get(name)?.set(depth, element);
    localTransitions.get(name)?.set(depth, element);
    if (options.lazy?.includes(name)) {
      lazyTransitions.add(name);
    } else {
      el.style.viewTransitionName = name;
    }
  };

  onMounted(() => {
    if (options.names) {
      Object.entries(options.names).forEach(([name, element]) => {
        setTransitionName(name, element);
      });
    }
  });

  onBeforeUnmount(() => {
    [...localTransitions.entries()].forEach(([name]) => {
      allTransitions.get(name)?.delete(depth);
      localTransitions.get(name)?.delete(depth);
    });
  });

  function setAllOtherTransitions(disable: boolean) {
    [...allTransitions.entries()].forEach(([name, depthMap]) => {
      [...depthMap.entries()].forEach(([dth, element]) => {
        if (dth !== depth) {
          const el = getElement(element);
          if (el) el.style.viewTransitionName = disable ? 'none' : name;
        }
      });
    });
  }

  async function transition() {
    setAllOtherTransitions(true);
    await doTransition(undefined, () => {
      setAllOtherTransitions(false);
    });
  }

  return {
    startViewTransition,
    transition,
  };
}

function startViewTransition(callback?: () => Promise<void>): AugmentedViewTransition {
  const viewTransition = {} as AugmentedViewTransition;

  if (!document.startViewTransition) {
    console.error('[useViewTransition] Browser does not support View Transitions Api');
    const callbackPromise = callback ? Promise.resolve(callback()) : Promise.resolve();
    return {
      captured: Promise.resolve(),
      updateCallbackDone: callbackPromise,
      ready: callbackPromise,
      finished: callbackPromise,
    };
  }

  if (document.startViewTransition) {
    const capturedPromise = new Promise<void>((resolve) => {
      const cb = async () => {
        resolve();
        await callback?.();
      };

      const nativeViewTransition = document.startViewTransition!(cb);
      viewTransition.updateCallbackDone = nativeViewTransition.updateCallbackDone;
      viewTransition.ready = nativeViewTransition.ready;
      viewTransition.finished = nativeViewTransition.finished;
    });

    viewTransition.captured = capturedPromise;
  }

  return viewTransition;
}

export function setAllLazyTransitions(disable: boolean) {
  [...allTransitions.entries()].forEach(([name, depthMap]) => {
    if (lazyTransitions.has(name)) {
      const item = depthMap.get(0);
      if (item) {
        const el = getElement(item);
        if (el) el.style.viewTransitionName = disable ? 'none' : name;
      }
    }
  });
}

export async function doTransition(callback?: () => Promise<void>, onEnd?: () => void) {
  const viewTransition = startViewTransition(callback);
  if (onEnd) viewTransition.finished.then(onEnd);
  await viewTransition.captured;
}
