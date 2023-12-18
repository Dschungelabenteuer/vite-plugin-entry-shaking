<script setup lang="ts">
type BadgeProps = { content: string };
defineProps<BadgeProps>();
</script>

<template>
  <span class="badge">{{ content }}</span>
</template>

<style lang="scss">
@import '../styles/mixins';

.badge {
  border-radius: var(--radius-lg);
  background: var(--overall-border-color);
  color: var(--text-emphasize-color);
  margin-inline: var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  @include padding;
}
</style>
