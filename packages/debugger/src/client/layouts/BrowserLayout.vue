<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import Input from '../components/Input.vue';
import IconButton from '../components/IconButton.vue';
import Dialog from '../components/Dialog.vue';

type BrowserLayoutProps = {
  name: string;
  pageIcon: string;
  filterLabel?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
};

withDefaults(defineProps<BrowserLayoutProps>(), {
  filterLabel: 'Change filters',
  searchLabel: 'Search',
  searchPlaceholder: 'Search…',
});

const filterDialogRef = ref<InstanceType<typeof Dialog> | null>(null);

const openFilters = () => {
  if (filterDialogRef.value) {
    filterDialogRef.value.dialogRef?.showModal();
  }
};
</script>

<template>
  <Dialog
    ref="filterDialogRef"
    title="filters"
  />
  <div class="titled-layout">
    <header class="page-header">
      <div class="header__meta">
        <Icon :icon="pageIcon" />
        <h1>{{ name }}</h1>
      </div>
      <div class="header__actions">
        <Input
          id="search"
          icon="tabler:search"
          :label="searchLabel"
          :hide-label="true"
          :placeholder="searchPlaceholder"
        />
        <IconButton
          ref="closeBtnRef"
          aria-controls="metrics-panel"
          :aria-expanded="true"
          icon="tabler:filter"
          :label="filterLabel"
          @click="openFilters"
        />
      </div>
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
  background: var(--browser-background-color);

  .page-header {
    @include flex-row(normal, center);
    height: var(--size-page-header);
    padding-inline: var(--spacing-lg) var(--spacing-md);

    h1 {
      font-size: var(--font-size-sm);
    }
  }

  .header {
    &__meta {
      @include flex-row(normal, center);
      svg {
        margin-inline-end: var(--spacing-md);
        font-size: var(--font-size-lg);
      }
    }

    &__actions {
      display: flex;
      margin-inline-start: auto;
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
