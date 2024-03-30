<script setup lang="ts">
defineProps<{ value: any }>();
</script>

<template>
  <div class="value-previewer">
    <span>Value</span>
    <code>{{ value }}</code>
  </div>
</template>

<style lang="scss">
.value-previewer {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  margin-block: 1rem;
  background-color: color-mix(in srgb, var(--background-color-alt) 20%, transparent);
  border: 1px solid var(--overall-border-color);

  span,
  code {
    margin-inline: 1rem;
  }
}
</style>
