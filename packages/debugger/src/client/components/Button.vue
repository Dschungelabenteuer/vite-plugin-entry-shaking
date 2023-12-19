<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

type ButtonProps = {
  icon: string;
  label: string;
  size: 'medium' | 'large';
};

const props = withDefaults(defineProps<ButtonProps>(), {
  size: 'medium',
});

const classes = computed(() => ['button', props.size]);

const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <button :class="classes">
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

  &.medium {
    @include button-medium;
  }

  &.large {
    @include button-large;
  }
}
</style>
