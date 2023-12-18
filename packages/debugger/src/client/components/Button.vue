<script setup lang="ts">
import { Icon } from '@iconify/vue';

type ButtonProps = {
  icon: string;
  label: string;
};

defineProps<ButtonProps>();

const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <button class="button">
    <Icon
      v-if="icon"
      :icon="icon"
    />
    {{ label }}
  </button>
</template>

<style lang="scss">
@import '../styles/mixins';

.button {
  @include button;
}
</style>
