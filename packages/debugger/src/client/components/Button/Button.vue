<script setup lang="ts">
import { ref } from 'vue';
import Kbd from '@component/Kbd.vue';
import Icon from '@component/Icon.vue';
import Badge from '@component/Badge/Badge.vue';
import Tooltip from '@component/Tooltip.vue';
import Popover from '@component/Popover.vue';
import { useClassNames } from '@composable/useClassNames';
import type { ButtonEvents, ButtonProps } from './Button.types';
import { useButton } from './useButton';

const $class = useClassNames('button');
const emit = defineEmits<ButtonEvents>();
const props = withDefaults(defineProps<ButtonProps>(), {
  disabled: undefined,
  shortcut: undefined,
  badge: undefined,
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
    v-bind="{ ...attributes }"
    v-on="handlers.tooltipHandlers"
    @click="handlers.handleClick"
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
      :name="icon"
    />

    <template v-if="!iconOnly">
      {{ label }}
    </template>

    <Badge
      v-if="badge !== undefined"
      :class="$class('badge')"
      :content="badge"
    />

    <Kbd
      v-if="shortcut"
      :content="shortcut"
      :dimmed="true"
    />
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
      {{ disabled ?? label }}
    </Tooltip>
    <template v-if="$slots.popover">
      <Popover
        :id="popoverId"
        ref="popoverRef"
        :is-open="popover.isOpen"
        :style="popover.styles"
        @close="popover.close"
      >
        <slot name="popover" />
      </Popover>
    </template>
  </Teleport>
</template>

<style lang="scss">
@include color-scheme(light) {
  --button-outline-color: var(--overall-border-color);
  --button-outline-color-hover: var(--overall-border-color-stronger);
}

@include color-scheme(dark) {
  --button-outline-color: var(--overall-border-color-stronger);
  --button-outline-color-hover: #573943;
}

.button {
  @include flex;

  height: var(--button-height, auto);
  padding: calc(var(--spacing-md) + 3px);
  color: var(--text-color);
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: calc(var(--radius-md) + 6px);

  &:hover,
  &:focus,
  &:active {
    color: var(--text-emphasize-color);
  }

  &:focus {
    outline: 0;
    box-shadow:
      inset 0 0 0 1px var(--button-outline-color),
      inset 0 0 0 4px var(--background-color),
      inset 0 0 0 6px var(--accent-color);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  svg {
    margin-inline-end: var(--spacing-md);
  }

  .kbd {
    margin-inline-start: var(--spacing-md);
  }

  &.icon-only {
    svg {
      margin-inline-end: 0;
    }
  }

  .shortcut {
    margin-inline: var(--spacing-md) 0;
  }
}
</style>

<style lang="scss">
.button {
  &.bordered {
    transition: ease var(--transition-duration-short);

    &:not(:focus) {
      box-shadow:
        inset 0 0 0 1px var(--button-outline-color),
        inset 0 0 0 0 transparent,
        inset 0 0 0 0 transparent;
    }

    &:hover {
      box-shadow:
        inset 0 0 0 1px var(--button-outline-color-hover),
        inset 0 0 0 0 transparent,
        inset 0 0 0 0 transparent;
    }
  }

  &.small {
    padding: calc(var(--spacing-sm) + 3px);

    &:not(.icon-only) {
      svg {
        margin-inline-end: var(--spacing-sm);
      }
    }
  }

  &.large {
    padding: var(--spacing-lg);
  }
}
</style>
