<script setup lang="ts">
import { ref, computed, provide, onMounted } from 'vue';
import { randomId } from '#utils';
import Button from '@component/Button.vue';
import { useClassNames } from '@composable/useClassNames';
import { useFocusTrap } from '@composable/useFocusTrap';
import { FLOATING_CONTAINER_CLASS, FLOATING_CONTAINER_ID_VAR } from '@composable/useFloating';

type DialogProps = {
  /** Dialog id. */
  id?: string;
  /** Dialog title. */
  title?: string;
  /** Dialog width. */
  width?: string;
  /** Dialog height. */
  height?: string;
};

type DialogEvents = {
  /** Emitted when the dialog is closed. */
  close: [];
};

const $class = useClassNames('dialog');
const emit = defineEmits<DialogEvents>();
const props = withDefaults(defineProps<DialogProps>(), {
  title: undefined,
  width: 'auto',
  height: 'auto',
  id: randomId('dialog'),
});

const enableTeleports = ref(false);
const element = ref<HTMLDialogElement | null>(null)!;
const timeout = ref<ReturnType<typeof setTimeout>>();
const classes = computed(() => [$class()]);
const trap = useFocusTrap(element);

provide(FLOATING_CONTAINER_ID_VAR, props.id);

/** Closes the dialog. */
const close = () => {
  element.value?.close();
};

/** Triggered when dialog is clicked. */
const handleClick = (event: Event) => {
  const [topTarget] = event.composedPath();
  if (topTarget === element.value) close();
};

/** Triggered when opening the dialog. */
const handleOpen = () => {
  // Clear any existing close animation's timeout.
  if (timeout.value) clearTimeout(timeout.value);
  // Refresh focus trap in case dialog content changed.
  trap.refresh();
};

/** Triggered when closing the dialog. */
const handleClose = () => {
  const animationCustomProp = '--transition-duration-short';
  const computedStyle = getComputedStyle(element.value!);
  const duration = computedStyle.getPropertyValue(animationCustomProp);
  const delay = duration.endsWith('ms')
    ? Number(duration.slice(0, -2))
    : Number(duration.slice(0, -1)) * 1000;
  // Wait for the closing animation to finish before emitting the close event.
  timeout.value = setTimeout(() => emit('close'), delay);
};

onMounted(() => {
  enableTeleports.value = true;
});

provide('enableTeleports', enableTeleports);

defineExpose({
  element,
  refreshFocusTrap: trap.refresh,
  focusFirst: trap.focusFirst,
  focusLast: trap.focusLast,
});
</script>

<template>
  <Teleport to=".layout-wrapper">
    <dialog
      ref="element"
      :class="classes"
      @click="handleClick"
      @close="handleClose"
      @open="handleOpen"
    >
      <div :class="$class('header')">
        <h2>{{ title }}</h2>
        <Button
          :class="$class('close')"
          autofocus
          label="Close"
          icon="x"
          :icon-only="true"
          @click="close"
        />
      </div>
      <div :class="$class('content')">
        <slot />
      </div>
      <div :class="$class('footer')">
        <slot name="footer" />
      </div>
      <div
        :id="id"
        :class="FLOATING_CONTAINER_CLASS"
      />
    </dialog>
  </Teleport>
</template>

<style lang="scss">
@include color-scheme(light) {
  --dialog-background-color: var(--overall-background-color);
  --dialog-backdrop-color: #ffffff44;
}

@include color-scheme(dark) {
  --dialog-background-color: color-mix(in srgb, var(--background-color-alt) 50%, rgb(9, 6, 19));
  --dialog-backdrop-color: color-mix(in srgb, var(--background-color-alt) 20%, transparent);
}

.dialog {
  view-transition-name: dialog;
  position: fixed;
  inset-block: 0;
  display: grid;
  grid-template-rows: 3rem 1fr 3rem;
  pointer-events: none;
  transform: translateY(-0.8rem);
  transform-origin: top center;
  opacity: 0;
  transition: all var(--easing-backwards) var(--transition-duration-short);
  overflow: visible;

  height: v-bind(height);
  width: v-bind(width);

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

  &::backdrop {
    view-transition-name: dialog-backdrop;
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

  &__footer {
    display: flex;
    align-items: center;
    justify-content: end;
    padding: var(--spacing-md) var(--spacing-lg);
    @include border-top;
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
