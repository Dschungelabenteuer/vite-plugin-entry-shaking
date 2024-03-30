<script setup lang="ts">
import { computed, inject } from 'vue';

import { store } from '#store';
import type { Diagnostic } from 'vite-plugin-entry-shaking';
import Toast from '@components/Toast/Toast.vue';
import { useClassNames } from '@composables/useClassNames';
import type { EntryDetailsProps } from '../Entries.types';

const $class = useClassNames('entry-diagnostics');
const entryDetails = inject<EntryDetailsProps>('entry-details')!;
const diagnostics = computed(() =>
  [...(entryDetails.entry?.diagnostics.values() ?? [])].reduce((out, i) => {
    const diagnostic = store.diagnostics.list[i];
    return [...out, diagnostic];
  }, [] as Diagnostic[]),
);
</script>

<template>
  <div :class="$class()">
    <Toast
      v-for="(diagnostic, i) in diagnostics"
      :key="i"
      type="warning"
    >
      {{ diagnostic?.message }}
    </Toast>
  </div>
</template>

<style lang="scss">
.entry-diagnostics {
  .toast {
    margin: var(--spacing-lg);

    div {
      color: var(--text-color) !important;
    }
  }
}
</style>
