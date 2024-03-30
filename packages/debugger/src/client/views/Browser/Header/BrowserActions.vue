<script setup lang="ts">
import { inject, ref } from 'vue';

import Input from '@components/Input/Input.vue';
import Button from '@components/Button/Button.vue';
import type { ClassNameFn } from '@composables/useClassNames';
import { useViewTransition } from '@composables/useViewTransition';
import type { BrowserProps, BrowserSlots, BrowserSearchFn } from '../Browser.types';

const $class = inject<ClassNameFn>('$class')!;
const props = defineProps<Required<BrowserProps>>();
const slots = defineSlots<Pick<BrowserSlots, 'filters'>>();
const headerSearchRef = ref<HTMLElement | null>(null);
const headerFilterButtonRef = ref<HTMLElement | null>(null);
useViewTransition({
  names: {
    'browser-header-search': headerSearchRef,
    'browser-header-filter-button': headerFilterButtonRef,
  },
});
const search = inject<BrowserSearchFn>('search')!;
</script>

<template>
  <div :class="$class('header-actions')">
    <Input
      id="search"
      ref="headerSearchRef"
      :class="$class('header-search')"
      :shortcut="/** @todo */ false ? 'Ctrl+F' : undefined"
      icon="search"
      :label="searchLabel"
      :hide-label="true"
      :placeholder="searchPlaceholder"
      @input="search"
    />
    <div
      ref="headerFilterButtonRef"
      :class="$class('header-icon')"
    >
      <Button
        v-if="$slots.filters"
        icon="filter"
        :floating-placement="'bottom-end'"
        :icon-only="true"
        :label="filterLabel"
      >
        <template #popover>
          <slot name="filters" />
        </template>
      </Button>
    </div>
  </div>
</template>

<style lang="scss">
.browser-view {
  &__header-actions {
    display: flex;
    margin-inline-start: auto;
  }
}

::view-transition-new(browser-header-filter-button) {
  width: fit-content;
  height: fit-content;
  overflow: clip;
  object-fit: cover;
  animation: 300ms ease scale-in forwards;
}

::view-transition-old(browser-header-filter-button) {
  width: fit-content;
  height: fit-content;
  overflow: clip;
  object-fit: cover;
  animation: 300ms ease scale-out forwards;
}
</style>
