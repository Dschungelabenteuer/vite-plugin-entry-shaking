<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

type ColorSchemeToggleProps = { isDark: boolean; };
const props = defineProps<ColorSchemeToggleProps>();
const emit = defineEmits<{ click: []; }>();
const onClick = () => emit('click');
const iconName = computed(() => (props.isDark ? 'tabler:sun' : 'tabler:moon'));
</script>

<template>
  <button
    aria-label="Toggle color scheme"
    class="color-scheme-switcher"
    @click="onClick"
  >
    <Icon :icon="iconName" />
  </button>
</template>

<style>
.color-scheme-switcher {
  padding: var(--spacing-md);
  cursor: pointer;
  border: 0;
}
</style>
