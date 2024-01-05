<script setup lang="ts">
import { useClassNames } from '@composable/useClassNames';

type ShortcutProps = {
  /** Content of the shortcut. */
  content: string;
};

const $class = useClassNames('shortcut');
const props = defineProps<ShortcutProps>();
</script>

<template>
  <kbd :class="$class()">
    {{ content }}
  </kbd>
</template>

<style lang="scss">
@include color-scheme(light) {
  --shortcut-opacity: 0.5;
}

@include color-scheme(dark) {
  --shortcut-opacity: 0.3;
}

.shortcut {
  border-radius: var(--radius-md);
  box-shadow: inset 0 0 0 1px var(--text-color);
  text-transform: uppercase;
  margin-inline: var(--spacing-sm);
  font-size: var(--font-size-2xs);
  font-weight: 600;
  font-family: monospace;
  color: var(--text-color);
  opacity: var(--shortcut-opacity);
  @include padding(var(--spacing-sm), var(--spacing-sm));
}
</style>
