<script setup lang="ts">
import { ref } from 'vue';
import { useDropdownMenu, type DropdownMenuItem } from '@composable/useDropdownMenu';
import Icon from './Icon.vue';

type DropdownMenuProps = {
  items: DropdownMenuItem[];
};

type DropdownMenuEvents = {
  close: [];
};

const props = defineProps<DropdownMenuProps>();
const emit = defineEmits<DropdownMenuEvents>();

const itemEls = ref<HTMLButtonElement[] | null>([]);
const { handleKeyPress } = useDropdownMenu(emit, itemEls);
</script>

<template>
  <ul class="vertical-menu">
    <li
      v-for="(item, i) in items"
      :key="i"
    >
      <button
        ref="itemEls"
        @click="item.action"
        @keypress="handleKeyPress"
      >
        <Icon
          v-if="item.icon"
          :name="item.icon"
        />
        {{ item.label }}
      </button>
    </li>
  </ul>
</template>

<style lang="scss"></style>
