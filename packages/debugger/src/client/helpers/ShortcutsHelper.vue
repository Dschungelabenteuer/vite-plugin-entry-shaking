<script setup lang="ts">
import { computed, ref } from 'vue';
import Kbd from '@component/Kbd.vue';
import Button from '@component/Button.vue';
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
      :class="$class('close-list')"
      :bordered="true"
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
  </Popover>
</template>

<style lang="scss">
.shortcuts-helper {
  position: absolute;
  bottom: var(--spacing-lg);
  width: 100%;
  max-width: 100vw;
  display: flex;
  justify-content: center;

  &__list {
    pointer-events: none;

    display: flex;
    ul {
      list-style-type: none;
      margin: var(--spacing-md);
      padding: 0;
    }

    li {
      display: flex;
      margin-inline: var(--spacing-md);
      margin-block-end: var(--spacing-sm);
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
    background-color: var(--popover-background-color);
    right: 0;
  }
}
</style>
