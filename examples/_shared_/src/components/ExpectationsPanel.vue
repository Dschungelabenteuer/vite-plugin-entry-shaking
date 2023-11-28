<script setup lang="ts">
import { inject, nextTick, ref, watch } from 'vue';
import IconButton from './IconButton.vue';
import type { ExpectationsPanel } from '../composables/useExpectationsPanel';

const closeBtnRef = ref<InstanceType<typeof IconButton> | null>(null);
const expectationsPanel = inject<ExpectationsPanel>('expectationsPanel')!;
const { toggle, openBtnId, isOpen } = expectationsPanel;

watch(isOpen, (open) => {
  nextTick(() => {
    const el = open ? closeBtnRef.value?.reference : document.getElementById(openBtnId);
    if (el) (el as HTMLElement).focus();
  });
});
</script>

<template>
  <div
    id="expectations-panel"
    role="region"
    class="expectations"
  >
    <header class="expectations__header">
      <IconButton
        ref="closeBtnRef"
        aria-controls="expectations-panel"
        :aria-expanded="true"
        icon="tabler:arrow-bar-right"
        label="Close expectations panel"
        @click="toggle"
      />
      <h2>Expectations</h2>
    </header>
  </div>
</template>

<style lang="scss">
@import '../styles/mixins';
.expectations {
  @include contained;
  max-width: 300px;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: var(--size-header) 1fr var(--size-footer);
  background: var(--overall-background-color);
  border-inline-start: 1px solid var(--overall-border-color);
  color: var(--text-color);

  &__header {
    box-shadow: 0 0 0 1px var(--overall-border-color);
    display: flex;
    align-items: center;

    > .icon-button {
      height: 100%;
    }

    h2 {
      font-size: 1.14rem;
      width: 100%;
      padding-inline-start: var(--spacing-md);
    }
  }
}
</style>
