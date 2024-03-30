<script setup lang="ts">
import { ref } from 'vue';

import Button from '@components/Button/Button.vue';
import { useClassNames } from '@composables/useClassNames';

import type { DropdownMenuProps, DropdownMenuEvents } from './DropdownMenu.types';
import { useDropdownMenu } from './useDropdownMenu';

const $class = useClassNames('dropdown-menu');
const emit = defineEmits<DropdownMenuEvents>();
const props = defineProps<DropdownMenuProps>();

const menuItemRefs = ref<HTMLButtonElement[] | null[]>([]);
const { handleKeydown } = useDropdownMenu(props, emit, menuItemRefs);
</script>

<template>
  <ul :class="$class()">
    <li
      v-for="(item, i) in items"
      :key="i"
    >
      <Button
        ref="menuItemRefs"
        :icon="item.icon"
        :label="item.label"
        @click="item.action"
        @keydown="handleKeydown"
      />
    </li>
  </ul>
</template>

<style lang="scss">
.dropdown-menu {
  padding: 0;
  margin-block: calc(-1 * var(--popover-padding-block));
  margin-inline: calc(-1 * var(--popover-padding-inline));
  list-style: none;

  li {
    padding: 0;
    margin: 0;

    &:not(:last-child) {
      box-shadow: 0 1px 0 0 var(--overall-border-color);
    }

    .button {
      justify-content: flex-start;
      width: 100%;

      &.active {
        outline: solid 2px transparent;
        outline-color: var(--accent-color);
        box-shadow:
          inset 0 0 0 1px var(--button-outline-color),
          inset 0 0 0 4px var(--background-color);
      }

      &:focus {
        color: var(--accent-color);
      }
    }
  }
}
</style>
