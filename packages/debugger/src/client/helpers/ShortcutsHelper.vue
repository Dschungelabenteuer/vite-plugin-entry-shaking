<script setup lang="ts">
import { computed, ref } from 'vue';
import Kbd from '@component/Kbd.vue';
import Button from '@component/Button/Button.vue';
import Popover from '@component/Popover.vue';
import { usePopover } from '@composable/usePopover';
import { useClassNames } from '@composable/useClassNames';

export type ShortcutData = {
  /** Shortcut's action label. */
  label: string;
  /** Shortcut's key(s) (array for key combinations) */
  key: string | string[];
  /** Is the shortcut disabled? */
  disabled?: boolean;
};

export type ShortcutGroup = {
  /** Group label. */
  label?: string;
  /** Group shortcuts. */
  items: ShortcutData[];
  /** Is the group disabled? */
  disabled?: boolean;
};

type ShortcutHelperProps = {
  /** Unique identifier for the helper. */
  id: string;
  /** Tooltip message (controls hidden). */
  message: string;
  /** Shortcuts (groupped) */
  shortcuts: ShortcutGroup[];
  /** Should the tooltip be shown? */
  showTooltip?: boolean;
  /** Should the shortcut list be shown? */
  showList?: boolean;
};

export type ShortcutHelperEvents = {
  /** Emitted when closing the shortcut list. */
  'close-list': [];
};

const $class = useClassNames('shortcuts-helper');
const emit = defineEmits<ShortcutHelperEvents>();
const props = defineProps<ShortcutHelperProps>();
const tooltipId = computed(() => `${props.id}-shortcuts-tooltip`);
const popoverId = computed(() => `${props.id}-shortcuts-popover`);

// Attachments.
const reference = ref<HTMLButtonElement | null>(null);
const tooltipRef = ref<InstanceType<typeof Popover> | null>(null);
const popoverRef = ref<InstanceType<typeof Popover> | null>(null);
const tooltip = usePopover(reference, tooltipRef);
const popover = usePopover(reference, popoverRef);

// Destructure so that refs get unwrapped in template.
const { styles: tooltipStyles } = tooltip;
const { styles: popoverStyles } = popover;
</script>

<template>
  <div
    ref="reference"
    :class="$class()"
  ></div>
  <Popover
    :id="tooltipId"
    ref="tooltipRef"
    :is-open="showTooltip ?? false"
    :style="tooltipStyles"
    @close="tooltip.close"
  >
    <div :class="$class('content')">
      <span>{{ message }}, </span>
      <span>press <Kbd content="H" /> to toggle controls.</span>
    </div>
  </Popover>

  <Popover
    :id="popoverId"
    ref="popoverRef"
    :is-open="showList ?? false"
    :style="popoverStyles"
    @close="popover.close"
  >
    <Button
      aria-controls="popoverId"
      icon="x"
      :icon-only="true"
      :class="[$class('close-list'), 'bordered']"
      size="small"
      label="Close shortcuts list"
      @click="emit('close-list')"
    />
    <div :class="$class('list')">
      <div
        v-for="(group, i) in shortcuts"
        :key="`shortcut-${i}`"
      >
        <ul>
          <li
            v-for="(shortcut, j) in group.items"
            :key="`shortcut-${i}-${j}`"
            :class="{ disabled: group.disabled || shortcut.disabled }"
          >
            <span>
              <Kbd :content="shortcut.key" />
            </span>
            <span>{{ shortcut.label }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div :class="$class('meta')">
      <div>
        <span>
          <Kbd content="H" />
        </span>
        <span>Toggle shortcut list</span>
      </div>
    </div>
  </Popover>
</template>

<style lang="scss">
.shortcuts-helper {
  position: absolute;
  bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 100vw;

  &__meta {
    display: flex;
    justify-content: center;
    padding: var(--spacing-sm);
    margin-block-start: var(--spacing-md);
    margin-inline: calc(var(--spacing-md) * -1);
    font-size: var(--font-size-xs);
    pointer-events: none;

    @include border-top;
  }

  &__list {
    display: flex;
    pointer-events: none;

    ul {
      padding: 0;
      margin: var(--spacing-md);
      list-style-type: none;
    }

    li {
      display: flex;
      margin-block-end: var(--spacing-sm);
      margin-inline: var(--spacing-md);
      transition: all ease var(--transition-duration-short);

      &.disabled {
        opacity: 0.3;
      }
    }

    .kbd {
      margin-inline-end: var(--spacing-md);
    }
  }

  &__close-list {
    position: absolute;
    top: calc(var(--spacing-md) * -1);
    right: 0;
    background-color: var(--popover-background-color);
  }
}
</style>
