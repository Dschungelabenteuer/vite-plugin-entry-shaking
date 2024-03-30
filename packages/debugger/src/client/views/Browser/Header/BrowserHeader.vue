<script setup lang="ts">
import { inject } from 'vue';

import type { ClassNameFn } from '@composables/useClassNames';
import type { BrowserProps, BrowserSlots } from '../Browser.types';
import BrowserMeta from './BrowserMeta.vue';
import BrowserCounts from './BrowserCounts.vue';
import BrowserActions from './BrowserActions.vue';

const $class = inject<ClassNameFn>('$class')!;
const slots = defineSlots<Pick<BrowserSlots, 'filters'>>();
const props = defineProps<Required<BrowserProps>>();
</script>

<template>
  <header :class="$class('header')">
    <BrowserMeta v-bind="props" />
    <BrowserCounts v-bind="props" />
    <BrowserActions v-bind="props">
      <template
        v-if="$slots.filters"
        #filters
      >
        <slot name="filters" />
      </template>
    </BrowserActions>
  </header>
</template>

<style lang="scss">
.browser-view {
  &__header {
    @include flex-row(normal, center);

    z-index: 1000;
    height: var(--size-page-header);
    padding-inline: var(--padding-page-header);

    &-title {
      font-size: var(--font-size-page-header);
    }
  }
}
</style>
