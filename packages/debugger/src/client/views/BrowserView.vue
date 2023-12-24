<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Input from '@component/Input.vue';
import Button from '@component/Button.vue';
import Dialog from '@component/Dialog.vue';

type BrowserViewProps = {
  /** Browser page name. */
  name: string;
  /** Page icon. */
  pageIcon: string;
  /** Label used for the "filter" button. */
  filterLabel?: string;
  /** Label used for the "search" input. */
  searchLabel?: string;
  /** Placeholder used for the "search" input. */
  searchPlaceholder?: string;
  /** Total count of items. */
  total?: number;
  /** Count of matched items. */
  matched?: number;
};

withDefaults(defineProps<BrowserViewProps>(), {
  filterLabel: 'Change filters',
  searchLabel: 'Search',
  searchPlaceholder: 'Search…',
  total: 0,
  matched: 0,
});

const emit = defineEmits<{ search: [q: string] }>();

const onSearch = (e: InputEvent) => {
  emit('search', (e.target as HTMLInputElement).value);
};
</script>

<template>
  <Dialog title="filters" />
  <div class="browser-view">
    <header class="page-header">
      <div class="header__meta">
        <Icon :icon="`tabler:${pageIcon}`" />
        <h1>{{ name }}</h1>
      </div>
      <div class="header__counts">
        <span v-if="total === matched">{{ total }} items</span>
        <span v-else>{{ matched }} / {{ total }} items</span>
      </div>
      <div class="header__actions">
        <Input
          id="search"
          icon="search"
          :label="searchLabel"
          :hide-label="true"
          :placeholder="searchPlaceholder"
          @input="onSearch"
        />
        <Button
          aria-controls="metrics-panel"
          icon="filter"
          :icon-only="true"
          :label="filterLabel"
        >
          <template #popover>
            <slot name="filters" />
          </template>
        </Button>
      </div>
      <slot name="header-after" />
    </header>
    <section class="page-content">
      <slot />
    </section>
  </div>
</template>

<style lang="scss">
@include color-scheme(light) {
  --browser-background-color: #fbfdfe;
}

@include color-scheme(dark) {
  --browser-background-color: transparent;
}

.browser-view {
  --size-page-header: 3rem;
  --size-page-content: car(var(--size-page) - var(--size-page-header));

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: var(--size-page-header) 1fr;
  height: var(--size-page);
  position: relative;
  background: var(--browser-background-color);
  overflow: hidden;

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

    &__counts {
      font-size: var(--font-size-2xs);
      @include padding;
      box-shadow: 0 0 0 1px var(--overall-border-color-stronger);
      border-radius: var(--radius-md);
      margin: var(--spacing-md);
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
