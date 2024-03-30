<script setup lang="ts">
import { ref, computed, provide, onMounted } from 'vue';
import { randomId } from '#utils';
import Button from '@components/Button/Button.vue';
import {
  TOASTER_CONTAINER_CLASS,
  TOASTER_CONTAINER_ID_VAR,
  useToaster,
} from '@components/Toast/useToaster';
import Toaster from '@components/Toast/Toaster.vue';
import { useClassNames } from '@composables/useClassNames';
import { FLOATING_CONTAINER_CLASS, FLOATING_CONTAINER_ID_VAR } from '@composables/useFloating';
import { useViewTransition } from '@composables/useViewTransition';
import type { DialogEvents, DialogProps, DialogSlots } from './Dialog.types';
import { useDialog } from './useDialog';

const $class = useClassNames('dialog');
const emit = defineEmits<DialogEvents>();
const slots = defineSlots<DialogSlots>();
const props = withDefaults(defineProps<DialogProps>(), {
  id: () => randomId('dialog'),
  title: undefined,
  width: 'auto',
  height: 'auto',
});

const element = ref<HTMLDialogElement | null>(null)!;
const toasterRef = ref<InstanceType<typeof Toaster> | null>(null);
const classes = computed(() => [$class(), { unpad: props.unpad }]);
const dialog = useDialog(props, emit, element);
const toaster = useToaster(toasterRef);
const { trap, close, handleClick, handleClose, handleOpen, teleport } = dialog;
const { dialogTransitionName, backdropTransitionName, isOpen } = dialog;
const enableTeleports = ref(false);

provide(TOASTER_CONTAINER_ID_VAR, `${props.id}-toaster`);
provide(FLOATING_CONTAINER_ID_VAR, `${props.id}-floating`);
provide('enableTeleports', enableTeleports);
provide('$toaster', toaster);

onMounted(() => {
  enableTeleports.value = true;
});

useViewTransition({
  names: {
    [dialogTransitionName.value]: element,
  },
});
defineExpose({
  element,
  refreshFocusTrap: trap.refresh,
  focusFirst: trap.focusFirst,
  focusLast: trap.focusLast,
});
</script>

<template>
  <Teleport
    :disabled="teleport.disabled.value"
    :to="teleport.to.value"
  >
    <dialog
      ref="element"
      :class="classes"
      @click="handleClick"
      @close="handleClose"
      @open="handleOpen"
    >
      <template v-if="isOpen">
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
      </template>
      <div
        :id="`${id}-floating`"
        :class="FLOATING_CONTAINER_CLASS"
      />
      <div
        :id="`${id}-toaster`"
        :class="TOASTER_CONTAINER_CLASS"
      />
      <Toaster ref="toasterRef" />
    </dialog>
  </Teleport>
</template>

<style lang="scss">
@include color-scheme(light) {
  --dialog-background-color: var(--overall-background-color);
  --dialog-backdrop-color: #fff4;
}

@include color-scheme(dark) {
  --dialog-background-color: color-mix(in srgb, var(--background-color-alt) 50%, rgb(9 6 19));
  --dialog-backdrop-color: color-mix(in srgb, var(--background-color-alt) 20%, transparent);
}

.dialog {
  position: fixed;
  inset-block: 0;
  display: grid;
  grid-template-rows: 3rem 1fr 3rem;
  width: v-bind(width);
  height: v-bind(height);
  padding: 0;
  margin: auto;
  overflow: visible;
  color: var(--text-subtle-color);
  pointer-events: none;
  background-color: var(--dialog-background-color);
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--dialog-shadow);
  box-shadow:
    0 0 0 1px var(--popover-border-color),
    0.4px 0.7px 0.9px hsl(var(--shadow-color) / 22%),
    1.1px 2px 2.6px -0.8px hsl(var(--shadow-color) / 22%),
    2.7px 4.8px 6.2px -1.7px hsl(var(--shadow-color) / 22%),
    6.5px 11.4px 14.8px -2.5px hsl(var(--shadow-color) / 22%);
  opacity: 0;
  transition:
    transform var(--easing-backwards) var(--transition-duration-short),
    opacity var(--easing-backwards) var(--transition-duration-short);
  transform: translateY(-0.8rem);
  transform-origin: top center;
  view-transition-name: dialog;

  &[open] {
    pointer-events: inherit;
    opacity: 1;
    transition:
      transform var(--easing-forwards) var(--transition-duration-medium),
      opacity var(--easing-forwards) var(--transition-duration-medium);
    transform: translateY(0);
  }

  &:focus {
    outline: 1px solid var(--accent-color);
  }

  &::backdrop {
    background: var(--dialog-backdrop-color);
    backdrop-filter: var(--blur-lg);
    animation: 300ms ease fade-in forwards;
    view-transition-name: dialog-backdrop;
  }

  &__header {
    display: flex;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    color: var(--text-emphasize-color);

    @include border-bottom;

    h2 {
      padding-block: 0;
      margin-block: 0;
      font-size: var(--font-size-lg);
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: end;
    padding: var(--spacing-md) var(--spacing-lg);

    @include border-top;
  }

  &__close.button {
    margin-inline-start: auto;
  }

  &__content {
    padding: var(--spacing-lg);
    overflow: auto;
  }

  .icon-button {
    margin-inline-start: auto;
  }

  &.unpad {
    .dialog {
      &__content {
        padding: 1px;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.dialog {
  &::backdrop {
    view-transition-name: v-bind(backdropTransitionName);
  }
}
</style>
