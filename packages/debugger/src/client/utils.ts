import { type Ref, type ComponentPublicInstance, toValue } from 'vue';

type TemplateRefTypes =
  | Ref<HTMLElement | null>
  | Ref<ComponentPublicInstance | null>
  | ComponentPublicInstance
  | HTMLElement
  | null;

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

export const isComponentInstance = (
  el: TemplateRefTypes,
): el is typeof el extends Ref
  ? Ref<ComponentPublicInstance | null>
  : ComponentPublicInstance | null => {
  const element = toValue(el);
  return element ? '$el' in element : false;
};

export const getElement = (el: TemplateRefTypes) => {
  const element = toValue(el);
  if (!element) return;
  return isComponentInstance(element) ? (element.$el as HTMLElement) : element;
};

export const getCustomProperty = (name: string) =>
  getComputedStyle(document.documentElement, null).getPropertyValue(name);

export const parseCssDuration = (duration: string) => {
  if (duration.endsWith('ms')) {
    return parseFloat(duration.replace('ms', ''));
  }

  return parseFloat(duration.replace('s', '')) * 1000;
};

export const formatDuration = (duration: number) => {
  if (duration < 1) return `${(duration * 1000).toFixed(0)}µs`;
  if (duration > 1000) return `${(duration / 1000).toFixed(2)}s`;
  return `${duration.toFixed(1)}ms`;
};

export const mergeKeyVal = ([key, val]: [key: string, col: any]) => ({ key, ...val });

export function relativePath(from: string, to: string) {
  const fromParts = from.split('/');
  const toParts = to.split('/');

  let i = 0;
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) i += 1;
  let output = '';
  if (i === fromParts.length) {
    output += './';
  } else {
    for (let j = i; j < fromParts.length; j += 1) output += '../';
  }
  for (let k = i; k < toParts.length; k += 1) {
    output += toParts[k];
    if (k < toParts.length - 1) {
      output += '/';
    }
  }

  return output;
}
