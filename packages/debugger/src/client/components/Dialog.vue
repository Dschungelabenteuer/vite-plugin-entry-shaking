<script setup lang="ts">
import { ref } from 'vue';
import IconButton from './IconButton.vue';

type BrowserLayoutProps = {
  title?: string;
};

withDefaults(defineProps<BrowserLayoutProps>(), {
  title: undefined,
});

const dialogRef = ref<HTMLDialogElement>();

defineExpose({ dialogRef });
</script>

<template>
  <Teleport to=".base-wrapper">
    <dialog
      ref="dialogRef"
      class="dialog"
    >
      <div class="dialog__header">
        <h2>{{ title }}</h2>
        <IconButton
          class="dialog__close"
          autofocus
          label="Close"
          icon="tabler:x"
        />
      </div>
      <div class="dialog__content">
        <p>This modal dialog has a groovy backdrop!</p>
      </div>
    </dialog>
  </Teleport>
</template>

<style lang="scss">
@import '../styles/mixins';

dialog::backdrop {
  backdrop-filter: blur(6px);
}

.dialog {
  margin: auto;
  background-color: var(--modal-background-color);
  border-radius: var(--radius-md);
  border: none;
  padding: 0;
  box-shadow: var(--modal-shadow);
  color: var(--text-subtle-color);

  &::backdrop {
    backdrop-filter: blur(3px);
    background: var(--modal-backdrop-color);
  }

  &__header {
    display: flex;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    color: var(--text-emphasize-color);
    @include border-bottom;

    h2 {
      font-size: var(--font-size-lg);
      margin-block: 0;
      padding-block: 0;
    }
  }

  &__content {
    padding: var(--spacing-lg);
  }

  .icon-button {
    margin-inline-start: auto;
  }
}
</style>
