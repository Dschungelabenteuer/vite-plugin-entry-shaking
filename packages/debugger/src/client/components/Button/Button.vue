<script setup lang="ts">
import { ref } from 'vue';

import Icon from '@components/Icon/Icon.vue';
import Tooltip from '@components/Tooltip/Tooltip.vue';
import Popover from '@components/Popover/Popover.vue';
import { useClassNames } from '@composables/useClassNames';
import type { ButtonEvents, ButtonSlots, ButtonProps } from './Button.types';
import { useButton } from './useButton';

const $class = useClassNames('button');
const emit = defineEmits<ButtonEvents>();
const slots = defineSlots<ButtonSlots>();
const props = withDefaults(defineProps<ButtonProps>(), {
  disabled: false,
  tooltipOptions: () => ({
    placement: 'top',
    autoupdatePosition: true,
    disable: false,
  }),
});

const reference = ref<HTMLButtonElement | null>(null);
const tooltipRef = ref<InstanceType<typeof Tooltip> | null>(null);
const popoverRef = ref<InstanceType<typeof Popover> | null>(null);
const button = useButton(props, emit, $class(), reference, tooltipRef, popoverRef);
const { attributes, handlers, tooltip, popover, teleport } = button;
const { popoverId } = attributes;

defineOptions({ inheritAttrs: false });
defineExpose({ reference });
</script>

<template>
  <button
    ref="reference"
    :disabled="disabled !== false && disabled !== undefined"
    v-bind="{ ...attributes }"
    v-on="handlers.tooltipHandlers"
    @click="handlers.handleClick"
    @keydown.exact="emit('keydown', $event)"
    @keydown.esc="handlers.handleEscape"
    @keydown.up="emit('arrow-up', $event)"
    @keydown.down="emit('arrow-down', $event)"
    @keydown.left="emit('arrow-left', $event)"
    @keydown.right="emit('arrow-right', $event)"
    @keydown.home="emit('key-home', $event)"
    @keydown.end="emit('key-end', $event)"
    @keydown.page-up="emit('page-up', $event)"
    @keydown.page-down="emit('page-down', $event)"
    @keydown.tab.exact="emit('tab', $event)"
    @keydown.tab.shift="emit('shift-tab', $event)"
  >
    <Icon
      v-if="icon"
      :class="$class('icon')"
      :name="icon"
    />

    <template v-if="!iconOnly">
      <span>{{ label }}</span>
    </template>

    <div
      v-if="$slots.after"
      :class="$class('after')"
    >
      <slot name="after" />
    </div>
  </button>

  <Teleport
    :disabled="teleport.disabled.value"
    :to="teleport.to.value"
  >
    <Tooltip
      v-if="iconOnly && !tooltipOptions.disabled"
      ref="tooltipRef"
      :is-open="tooltip.isOpen && (!popover.isOpen || !$slots.popover)"
      :style="{ ...tooltip.styles }"
    >
      {{ label }}
    </Tooltip>

    <template v-if="$slots.popover">
      <Popover
        :id="popoverId"
        ref="popoverRef"
        :is-open="popover.isOpen"
        :style="popover.styles"
        @close="popover.close"
      >
        <template #default="{ isTransitioning }">
          <slot
            name="popover"
            :is-open="popover.isOpen"
            :is-transitioning
          />
        </template>
      </Popover>
    </template>
  </Teleport>
</template>

<style lang="scss" data-desc="tokens">
@include color-scheme(light) {
  --button-outline-color: var(--overall-border-color);
  --button-outline-color-hover: var(--overall-border-color-stronger);
}

@include color-scheme(dark) {
  --button-outline-color: var(--overall-border-color-stronger);
  --button-outline-color-hover: #573943;
}
</style>

<style lang="scss" data-desc="styling">
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  // Layout.
  height: var(--button-height, 2.45rem);
  padding: calc(var(--spacing-md) + 3px);
  margin-inline: var(--spacing-sm);

  // Base styling.
  color: var(--text-color);
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: calc(var(--radius-md) + 6px);
  outline: solid 2px transparent;
  outline-offset: -6px;

  &:first-of-type {
    margin-inline-start: 0;
  }

  &:last-of-type {
    margin-inline-end: 0;
  }

  &:hover,
  &:focus,
  &:active {
    color: var(--text-emphasize-color);
  }

  &.active,
  &:focus {
    outline-color: var(--accent-color);
    box-shadow:
      inset 0 0 0 1px var(--button-outline-color),
      inset 0 0 0 4px var(--background-color);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  &__icon {
    margin-inline-end: var(--spacing-md);
  }

  &.icon-only {
    .button {
      &__icon {
        margin-inline-end: 0;
      }
    }
  }

  &__after {
    margin-inline: var(--spacing-md) 0;
  }
}
</style>

<style lang="scss" data-desc="variants">
.button {
  &.bordered {
    transition: all ease var(--transition-duration-short);

    &:not(:focus) {
      box-shadow:
        inset 0 0 0 1px var(--button-outline-color),
        inset 0 0 0 0 transparent;
    }

    &:hover {
      box-shadow:
        inset 0 0 0 1px var(--button-outline-color-hover),
        inset 0 0 0 0 transparent;
    }
  }

  &.small {
    height: var(--button-height-small, 2rem);
    padding: calc(var(--spacing-md) + 3px);
  }

  &.large {
    padding: var(--spacing-lg);
  }
}
</style>
