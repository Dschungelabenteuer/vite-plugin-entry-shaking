<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

type IconProps = {
  /** Icon name. */
  name: string;
};

const props = defineProps<IconProps>();

const set = 'tabler';
const icon = computed(() => `${set}:${props.name}`);
</script>

<template>
  <Icon :icon="icon" />
</template>
