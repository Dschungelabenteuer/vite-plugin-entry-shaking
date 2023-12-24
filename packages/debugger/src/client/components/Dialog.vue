<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Button from './Button.vue';

type DialogProps = {
  /** Dialog title. */
  title?: string;
  /** Is wide mode ? */
  wide?: boolean;
};

const props = withDefaults(defineProps<DialogProps>(), {
  title: undefined,
});

const element = ref<HTMLDialogElement>();
const body = document.querySelector('body');
const classes = computed(() => ['dialog', props.wide ? 'wide' : '']);
const close = () => element.value?.close();

defineExpose({ element });
</script>

<template>
  <Teleport to=".layout-wrapper">
    <dialog
      ref="element"
      :class="classes"
      @click="close"
    >
      <div class="dialog__header">
        <h2>{{ title }}</h2>
        <Button
          class="dialog__close"
          autofocus
          label="Close"
          icon="x"
          :icon-only="true"
          @click="close"
        />
      </div>
      <div class="dialog__content">
        <slot />
      </div>
    </dialog>
  </Teleport>
</template>

<style lang="scss">
@include color-scheme(light) {
  --dialog-background-color: var(--overall-background-color);
  --dialog-backdrop-color: #ffffff44;
}

@include color-scheme(dark) {
  --dialog-background-color: color-mix(in srgb, var(--background-color-alt) 30%, black);
  --dialog-backdrop-color: color-mix(in srgb, var(--background-color-alt) 20%, transparent);
}

.dialog {
  position: fixed;
  inset-block: 0;
  display: grid;
  grid-template-rows: 3rem 1fr;
  pointer-events: none;
  transform: translateY(-0.8rem);
  transform-origin: top center;
  opacity: 0;
  transition: all var(--easing-backwards) var(--transition-duration-short);
  overflow: hidden;

  margin: auto;
  background-color: var(--dialog-background-color);
  border-radius: var(--radius-md);
  border: none;
  padding: 0;
  box-shadow: var(--dialog-shadow);
  color: var(--text-subtle-color);
  box-shadow:
    0 0 0 1px var(--popover-border-color),
    0.4px 0.7px 0.9px hsl(var(--shadow-color) / 0.22),
    1.1px 2px 2.6px -0.8px hsl(var(--shadow-color) / 0.22),
    2.7px 4.8px 6.2px -1.7px hsl(var(--shadow-color) / 0.22),
    6.5px 11.4px 14.8px -2.5px hsl(var(--shadow-color) / 0.22);

  &[open] {
    pointer-events: inherit;
    transform: translateY(0);
    opacity: 1;
    transition: all var(--easing-forwards) var(--transition-duration-medium);
  }

  &.wide {
    max-height: 80vh;
    max-width: 80vw;
  }

  &::backdrop {
    backdrop-filter: var(--blur-lg);
    background: var(--dialog-backdrop-color);
    transition: all ease var(--transition-duration-short);
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

  &__close {
    margin-inline-start: auto;
  }

  &__content {
    padding: var(--spacing-lg);
    overflow: auto;
  }

  .icon-button {
    margin-inline-start: auto;
  }
}
</style>
