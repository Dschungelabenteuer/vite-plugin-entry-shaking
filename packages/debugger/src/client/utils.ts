import type { Ref, ComponentPublicInstance } from 'vue';

const randomIntString = () => Math.random().toString(36);
const randomString = () =>
  performance.now().toString().replace('.', '_') +
  Date.now().toString(36) +
  randomIntString().substring(2, 5);

export const randomId = (prefix = ''): string => prefix + randomString().toUpperCase();
export const getElementBoundaries = (element: HTMLElement): { top: number; bottom: number } => {
  const { top, height } = element.getBoundingClientRect();
  return {
    top,
    bottom: top + height,
  };
};

const isComponentInstance = (
  el: Ref<HTMLElement | null> | Ref<ComponentPublicInstance | null>,
): el is Ref<ComponentPublicInstance | null> => (el.value ? '$el' in el.value : false);

export const getElement = (el: Ref<HTMLElement | null> | Ref<ComponentPublicInstance | null>) => {
  if (!el?.value) return;
  return isComponentInstance(el) ? (el.value.$el as HTMLElement) : el.value;
};

export const getCustomProperty = (name: string) =>
  getComputedStyle(document.documentElement, null).getPropertyValue(name);

export const parseCssDuration = (duration: string) => {
  if (duration.endsWith('ms')) {
    return parseFloat(duration.replace('ms', ''));
  }

  return parseFloat(duration.replace('s', '')) * 1000;
};
