<script setup lang="ts">
import { computed, useAttrs, ref, h } from 'vue';
import { randomId } from '#utils';
import { usePopover } from '@composable/usePopover';
import { useTooltip } from '@composable/useTooltip';
import { useClassNames } from '@composable/useClassNames';
import Icon from '@component/Icon.vue';
import Tooltip from '@component/Tooltip.vue';
import Popover from '@component/Popover.vue';
import Shortcut from '@component/Shortcut.vue';

/** Stringified boolean type. */
type Booleanish = 'true' | 'false';

type ButtonProps = {
  /** Button icon. */
  icon: string;
  /** Button label. */
  label: string;
  /** Button size. */
  size?: 'small' | 'medium' | 'large';
  /** Should we only show the icon? */
  iconOnly?: boolean;
  /** Should the button be bordered. */
  bordered?: boolean;
  /** Should we disabled auto-tooltip when using `iconOnly`? */
  disableTooltip?: boolean;
  /** If specified, reason why the button is disabled. */
  disabled?: string;
  /** If specified, adds a shortcut hint to button action. */
  shortcut?: string;
};

type ButtonEvents = {
  /** Emitted when clicking the button. */
  'click': [];
  /** Emitted when pressing the Arrow Up key.. */
  'arrow-up': [event: KeyboardEvent];
  /** Emitted when pressing the Arrow Down key.. */
  'arrow-down': [event: KeyboardEvent];
  /** Emitted when pressing the Arrow Left key.. */
  'arrow-left': [event: KeyboardEvent];
  /** Emitted when pressing the Arrow Right key.. */
  'arrow-right': [event: KeyboardEvent];
  /** Emitted when pressing the Page Up key.. */
  'page-up': [event: KeyboardEvent];
  /** Emitted when pressing the Page Down key.. */
  'page-down': [event: KeyboardEvent];
  /** Emitted when pressing the Arrow Home key.. */
  'key-home': [event: KeyboardEvent];
  /** Emitted when pressing the Arrow End key.. */
  'key-end': [event: KeyboardEvent];
  /** Emitted when escaping. */
  'escape': [event: KeyboardEvent];
  /** Emitted when shift+tabbing. */
  'shift-tab': [event: KeyboardEvent];
  /** Emitted when tabbing. */
  'tab': [event: KeyboardEvent];
};

const $class = useClassNames('button');
const emit = defineEmits<ButtonEvents>();
const props = withDefaults(defineProps<ButtonProps>(), {
  size: 'medium',
  disabled: undefined,
  shortcut: undefined,
});

// Attributes.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const id = computed(() => (attrs['id'] as string) ?? randomId('btn'));
const ariaLabel = computed(() => attrs['aria-label'] as string | undefined);
const ariaControls = computed(() => attrs['aria-expanded'] as string);
const ariaExpanded = computed(() => attrs['aria-expanded'] as Booleanish);
const tabindex = computed(() => attrs['tabindex'] as number | undefined);
const popoverId = computed(() => `${id.value}-popover`);
const classes = computed(() => [
  attrs.class ?? '',
  $class(),
  props.size,
  { bordered: props.bordered },
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

const handleEscape = ($event: KeyboardEvent) => {
  emit('escape', $event);
  popover?.close();
};

defineExpose({ reference });
</script>

<template>
  <button
    :id="id"
    ref="reference"
    :class="classes"
    :disabled="disabled !== undefined"
    :aria-label="ariaLabel ?? label"
    :aria-expanded="$slots.popover ? isPopoverOpen : ariaExpanded"
    :aria-controls="$slots.popover ? popoverId : ariaControls"
    :tabindex="tabindex"
    :title="disabled"
    v-on="tooltip.handlers"
    @click="handleClick"
    @keydown.esc="handleEscape"
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

    <Shortcut
      v-if="shortcut"
      :content="shortcut"
    />
  </button>

  <Tooltip
    v-if="iconOnly && !disableTooltip"
    ref="tooltipRef"
    :is-open="isTooltipOpen && !isPopoverOpen"
    :style="tooltipStyles"
  >
    {{ disabled ?? label }}
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
  --button-outline-color-hover: var(--overall-border-color-stronger);
}

@include color-scheme(dark) {
  --button-outline-color: var(--overall-border-color-stronger);
  --button-outline-color-hover: #573943;
}

.button {
  @include button;
}
</style>
