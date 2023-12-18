<script setup lang="ts">
import type { LogLevel } from 'vite';
import { computed } from 'vue';

type LogProps = {
  content: string;
  level: LogLevel;
  faded?: boolean;
};

const props = defineProps<LogProps>();

const logClass = computed(() => ['log', props.faded ? 'faded' : '']);
</script>

<template>
  <div :class="logClass">
    <div class="log__level">{{ level }}</div>
    <div class="log__content">{{ content }}</div>
  </div>
</template>

<style lang="scss">
@import '../styles/mixins';

.log {
  display: grid;
  grid-template-columns: 5rem 1fr;
  grid-template-rows: 3rem;
  align-items: center;
  padding-block: var(--spacing-sm);
  @include border-bottom;
  &.faded {
    opacity: 0.6;
  }
}
</style>
