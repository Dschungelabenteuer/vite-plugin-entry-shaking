<script setup lang="ts">
import { Icon } from '@iconify/vue';

type TitledLayoutProps = { name: string; pageIcon?: string };
defineProps<TitledLayoutProps>();
</script>

<template>
  <div class="titled-layout">
    <header class="page-header">
      <Icon
        v-if="pageIcon"
        :icon="pageIcon"
      />
      <h1>{{ name }}</h1>
      <slot name="header-after" />
    </header>
    <section class="page-content">
      <slot />
    </section>
  </div>
</template>

<style lang="scss">
@import '../styles/mixins';

.titled-layout {
  --size-page-header: 3rem;
  --size-page-content: car(var(--size-page) - var(--size-page-header));

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: var(--size-page-header) 1fr;
  height: var(--size-page);
  position: relative;

  .page-header {
    @include flex-row(normal, center);
    height: var(--size-page-header);
    padding-inline: var(--spacing-lg);

    svg {
      margin-inline-end: var(--spacing-md);
      font-size: var(--font-size-lg);
    }
  }

  .page-content {
    height: var(--size-page-content);
    margin: var(--spacing-md);
    margin-block-start: 0;
    overflow-y: auto;
    border-radius: var(--radius-md);
    box-shadow: 0 0 0 1px var(--overall-border-color);
    background: var(--overall-background-color);
  }
}
</style>
