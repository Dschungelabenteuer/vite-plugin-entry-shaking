<script setup lang="ts">
import { useClassNames } from '@composables/useClassNames';

import type { BadgeProps } from './Badge.types';
import { useBadge } from './useBadge';

const $class = useClassNames('badge');
const props = defineProps<BadgeProps>();
const { dataAttributes } = useBadge(props);
</script>

<template>
  <span
    :class="$class()"
    v-bind="dataAttributes"
  >
    <span class="sr-only">
      {{ content }}
    </span>
  </span>
</template>

<style lang="scss">
.badge {
  padding: var(--spacing-sm) var(--spacing-md);
  margin-inline: var(--spacing-sm);
  font-size: var(--font-size-2xs);
  font-weight: 600;
  color: var(--text-emphasize-color);
  background: var(--overall-border-color);
  border-radius: var(--radius-lg);
}
</style>

<style lang="scss" scoped>
.badge {
  &::before {
    content: attr(data-display-content);
  }

  &::after {
    content: attr(data-max-sign);
  }
}
</style>
