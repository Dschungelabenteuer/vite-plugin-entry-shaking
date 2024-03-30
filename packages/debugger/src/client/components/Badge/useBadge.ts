import { computed } from 'vue';

import type { BadgeProps } from './Badge.types';

export const NUMERIC_MAX_SIGN = '+';
export const STRING_MAX_SIGN = '…';

/**
 * Badge component may display both numeric and string content.
 * It supports setting a maximum length for textual content, and a maximum value
 * for numeric content. This value is set through the `max` prop. This maximum is
 * only applied visually: badge's actual content is preserved for convinience and
 * accessibility reasons
 * .
 * @param props Props passed to Badge component.
 */
export function useBadge(props: BadgeProps) {
  const maxReached = computed(() => {
    const { content, max } = props;
    if (!max) return false;
    return (
      (typeof content === 'number' && content > max) ||
      (typeof content === 'string' && content.length > max)
    );
  });

  const displayContent = computed(() => {
    const { content, max } = props;
    if (!maxReached.value) return content;
    return typeof content === 'number' ? max : content.slice(0, max! - 1);
  });

  const displayMaxSign = computed(() => {
    if (!maxReached.value) return '';
    return typeof props.content === 'number' ? NUMERIC_MAX_SIGN : STRING_MAX_SIGN;
  });

  const dataAttributes = computed(() => ({
    'data-display-content': displayContent.value,
    'data-max-sign': displayMaxSign.value,
  }));

  return {
    /** Data attributes used to feed pseudo-elements that display badge's actual content. */
    dataAttributes,
  };
}
