<script setup lang="ts">
import { computed, provide } from 'vue';

import { useClassNames } from '@composables/useClassNames';
import type { BrowserEvents, BrowserProps, BrowserSearchFn, BrowserSlots } from './Browser.types';
import BrowserHeader from './Header/BrowserHeader.vue';

const $class = useClassNames('browser-view');
const slots = defineSlots<BrowserSlots>();
const emit = defineEmits<BrowserEvents>();
const props = withDefaults(defineProps<BrowserProps>(), {
  pageIcon: undefined,
  filterLabel: 'Change filters',
  searchLabel: 'Search',
  searchPlaceholder: 'Search…',
  total: 0,
  matched: 0,
});

const allProps = computed(() => props as Required<BrowserProps>);
const classes = computed(() => [$class(), props.condensed ? 'condensed' : '']);
const search: BrowserSearchFn = (e) => emit('search', (e.target as HTMLInputElement).value);

provide('$class', $class);
provide('search', search);
</script>

<template>
  <div :class="classes">
    <BrowserHeader v-bind="allProps">
      <template
        v-if="$slots.filters"
        #filters
      >
        <slot name="filters" />
      </template>
    </BrowserHeader>
    <section :class="$class('content')">
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
  --size-page-content: calc(100% - var(--spacing-md));
  --size-page-header: 3rem;
  --padding-page-header: var(--spacing-lg) var(--spacing-md);
  --font-size-page-header: var(--font-size-sm);

  &.condensed {
    --size-page-header: 2.85rem;
    --padding-page-header: var(--spacing-md) var(--spacing-sm);
    --font-size-page-header: var(--font-size-xs);
  }

  position: relative;
  display: grid;
  grid-template-rows: var(--size-page-header) 1fr;
  grid-template-columns: 1fr;
  height: var(--size-page);
  max-height: 100%;
  overflow: hidden;
  background: var(--browser-background-color);

  &__content {
    height: var(--size-page-content);
    margin: var(--spacing-md);
    margin-block-start: 0;
    overflow-y: auto;
    background: var(--overall-background-color);
    border-radius: var(--radius-md);
    box-shadow: 0 0 0 1px var(--overall-border-color);
  }
}
</style>
