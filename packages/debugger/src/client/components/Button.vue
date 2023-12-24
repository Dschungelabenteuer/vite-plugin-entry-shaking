<script setup lang="ts">
import { computed, useAttrs, ref } from 'vue';
import { Icon } from '@iconify/vue';

import { useTooltip } from '@composable/useTooltip';
import { usePopover } from '@composable/usePopover';
import { randomId } from '#utils';
import Tooltip from './Tooltip.vue';
import Popover from './Popover.vue';

/** Stringified boolean type. */
type Booleanish = 'true' | 'false';

type ButtonProps = {
  /** Button icon. */
  icon: string;
  /** Button label. */
  label: string;
  /** Button size. */
  size?: 'medium' | 'large';
  /** Should we only show the icon? */
  iconOnly?: boolean;
  /** Should we disabled auto-tooltip when using `iconOnly`? */
  disableTooltip?: boolean;
};

const props = withDefaults(defineProps<ButtonProps>(), {
  size: 'medium',
});

const emit = defineEmits<{ click: [] }>();

// Attributes.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const id = computed(() => (attrs['id'] as string) ?? randomId('btn'));
const ariaLabel = computed(() => attrs['aria-label'] as string | undefined);
const ariaControls = computed(() => attrs['aria-expanded'] as string);
const ariaExpanded = computed(() => attrs['aria-expanded'] as Booleanish);
const popoverId = computed(() => `${id.value}-popover`);
const classes = computed(() => [
  attrs.class ?? '',
  'button',
  props.size,
  { 'icon-only': props.iconOnly },
]);

// Attachments.
const reference = ref<HTMLButtonElement | null>(null);
const tooltipRef = ref<InstanceType<typeof Tooltip> | null>(null);
const popoverRef = ref<InstanceType<typeof Popover> | null>(null);
const tooltip = useTooltip(reference, tooltipRef);
const popover = usePopover(reference, popoverRef);

// Destructure so that refs get unwrapped in template.
const { isOpen: isTooltipOpen, styles: tooltipStyles } = tooltip;
const { isOpen: isPopoverOpen, styles: popoverStyles } = popover;

const handleClick = () => {
  emit('click');
  popover?.toggle();
};

defineExpose({ reference });
</script>

<template>
  <button
    :id="id"
    ref="reference"
    :class="classes"
    :aria-label="ariaLabel ?? label"
    :aria-expanded="$slots.popover ? isPopoverOpen : ariaExpanded"
    :aria-controls="$slots.popover ? popoverId : ariaControls"
    v-on="tooltip.handlers"
    @click="handleClick"
    @keyup.esc="popover.close"
  >
    <Icon
      v-if="icon"
      :icon="`tabler:${icon}`"
    />
    <template v-if="!iconOnly">
      {{ label }}
    </template>
  </button>

  <Tooltip
    v-if="iconOnly && !disableTooltip"
    ref="tooltipRef"
    :is-open="isTooltipOpen && !isPopoverOpen"
    :style="tooltipStyles"
  >
    {{ label }}
  </Tooltip>

  <template v-if="$slots.popover">
    <Popover
      :id="popoverId"
      ref="popoverRef"
      :is-open="isPopoverOpen"
      :style="popoverStyles"
      @close="popover.close"
    >
      <slot name="popover" />
    </Popover>
  </template>
</template>

<style lang="scss">
@include color-scheme(light) {
  --button-outline-color: var(--overall-border-color);
}

@include color-scheme(dark) {
  --button-outline-color: #3d2d2c;
}

.button {
  @include button;

  svg {
    margin-inline-end: var(--spacing-md);
  }

  &.icon-only {
    svg {
      margin-inline-end: inherit;
    }
  }

  &.medium {
    @include button-medium;
  }

  &.large {
    @include button-large;
  }
}
</style>
