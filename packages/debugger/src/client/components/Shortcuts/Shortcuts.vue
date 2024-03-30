<script setup lang="ts">
import { provide, ref } from 'vue';

import { randomId } from '#utils';
import { useClassNames } from '@composables/useClassNames';
import type { ShortcutsEvents, ShortcutsProps } from './Shortcuts.types';
import ShortcutsHint from './ShortcutsHint.vue';
import ShortcutsList from './ShortcutsList.vue';

const $class = useClassNames('shortcuts-helper');
const emit = defineEmits<ShortcutsEvents>();
const props = withDefaults(defineProps<ShortcutsProps>(), {
  id: () => randomId('shortcuts'),
});

const reference = ref<HTMLButtonElement | null>(null);
provide('$class', $class);
provide('reference', reference);
</script>

<template>
  <div
    ref="reference"
    :class="$class()"
  >
    <ShortcutsHint
      v-if="!showList"
      :id
      :message
      :show-tooltip
    />
    <ShortcutsList
      :id
      :shortcuts
      :show-list
      @close-list="emit('close-list')"
    />
  </div>
</template>

<style lang="scss">
.shortcuts-helper {
  position: absolute;
  bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 100vw;

  > div {
    position: absolute;
    bottom: 0;
  }
}
</style>
