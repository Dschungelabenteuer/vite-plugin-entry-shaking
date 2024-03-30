<script setup lang="ts">
import type { Ref } from 'vue';
import { computed, inject, ref } from 'vue';

import Popover from '@components/Popover/Popover.vue';
import { usePopover } from '@components/Popover/usePopover';
import Button from '@components/Button/Button.vue';
import Kbd from '@components/Kbd/Kbd.vue';
import type { ClassNameFn } from '@composables/useClassNames';
import type { ShortcutsListProps, ShortcutsEvents } from './Shortcuts.types';

const $class = inject<ClassNameFn>('$class')!;
const emit = defineEmits<ShortcutsEvents>();
const props = defineProps<ShortcutsListProps>();

const reference = inject<Ref<HTMLButtonElement | null>>('reference')!;
const popoverRef = ref<InstanceType<typeof Popover> | null>(null);
const popover = usePopover(reference, popoverRef);
const popoverId = computed(() => `${props.id}-shortcuts-popover`);
</script>

<template>
  <Popover
    :id="popoverId"
    ref="popoverRef"
    :is-open="showList ?? false"
    :style="popover.styles"
    @close="popover.close"
  >
    <Button
      aria-controls="popoverId"
      icon="x"
      :icon-only="true"
      :class="[$class('close-list'), 'bordered', 'small']"
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
