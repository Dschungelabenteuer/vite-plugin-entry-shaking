<script setup lang="ts">
import { useClassNames } from '@composable/useClassNames';

type BadgeProps = {
  /** Content of the badge. */
  content: string;
};

const $class = useClassNames('badge');
const props = defineProps<BadgeProps>();
</script>

<template>
  <span :class="$class()">
    {{ content }}
  </span>
</template>

<style lang="scss">
.badge {
  border-radius: var(--radius-lg);
  background: var(--overall-border-color);
  color: var(--text-emphasize-color);
  margin-inline: var(--spacing-sm);
  font-size: var(--font-size-2xs);
  font-weight: 600;
  @include padding;
}
</style>
