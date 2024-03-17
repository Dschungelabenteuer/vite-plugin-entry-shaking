<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';
import Input from '@component/Input.vue';
import Button from '@component/Button/Button.vue';
import { useClassNames } from '@composable/useClassNames';
import { useViewTransition } from '@composable/useViewTransition';
import type { BrowserViewEvents, BrowserViewProps } from './Browser.types';

const $class = useClassNames('browser-view');
const emit = defineEmits<BrowserViewEvents>();
const props = withDefaults(defineProps<BrowserViewProps>(), {
  pageIcon: undefined,
  filterLabel: 'Change filters',
  searchLabel: 'Search',
  searchPlaceholder: 'Search…',
  total: 0,
  matched: 0,
});

const classes = computed(() => [$class(), props.condensed ? 'condensed' : '']);
const headerTitleRef = ref<HTMLElement | null>(null);
const headerIconRef = ref<HTMLElement | null>(null);
const headerSearchRef = ref<HTMLElement | null>(null);
const headerFilterButtonRef = ref<HTMLElement | null>(null);
const headerCountsRef = ref<HTMLElement | null>(null);
const transitions = useViewTransition({
  names: {
    'browser-header-title': headerTitleRef,
    'browser-header-icon': headerIconRef,
    'browser-header-search': headerSearchRef,
    'browser-header-filter-button': headerFilterButtonRef,
    'browser-header-counts': headerCountsRef,
  },
});

const onSearch = (e: InputEvent) => {
  emit('search', (e.target as HTMLInputElement).value);
};
</script>

<template>
  <div :class="classes">
    <header :class="$class('header')">
      <div :class="$class('header-meta')">
        <div
          ref="headerIconRef"
          :class="$class('header-icon')"
        >
          <Icon
            v-if="pageIcon"
            :icon="`tabler:${pageIcon}`"
          />
        </div>
        <h1
          ref="headerTitleRef"
          :class="$class('header-title')"
        >
          {{ name }}
        </h1>
      </div>
      <div
        ref="headerCountsRef"
        :class="$class('header-counts')"
      >
        <span v-if="total === matched">{{ total }} items</span>
        <span v-else>{{ matched }} / {{ total }} items</span>
      </div>
      <div :class="$class('header-actions')">
        <Input
          id="search"
          ref="headerSearchRef"
          :class="$class('header-search')"
          shortcut="Ctrl+F"
          icon="search"
          :label="searchLabel"
          :hide-label="true"
          :placeholder="searchPlaceholder"
          @input="onSearch"
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
      <slot name="header-after" />
    </header>
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
  --size-page-content: calc(100% - var(--spacing-xs));
  --size-page-header: 3rem;
  --padding-page-header: var(--spacing-lg) var(--spacing-md);
  --font-size-page-header: var(--font-size-sm);

  &.condensed {
    --size-page-header: 2.75rem;
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

  &__header {
    @include flex-row(normal, center);

    z-index: 1000;
    height: var(--size-page-header);
    padding-inline: var(--padding-page-header);

    &-title {
      font-size: var(--font-size-page-header);
    }

    &-meta {
      @include flex-row(normal, center);

      svg {
        margin-inline-end: var(--spacing-md);
        font-size: var(--font-size-lg);
      }
    }

    &-counts {
      @include padding;

      margin: var(--spacing-md);
      font-size: var(--font-size-2xs);
      border-radius: var(--radius-md);
      box-shadow: 0 0 0 1px var(--overall-border-color-stronger);
    }

    &-actions {
      display: flex;
      margin-inline-start: auto;
    }
  }

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

::view-transition-new(browser-header-icon) {
  animation: 300ms ease scale-in forwards;
}

::view-transition-old(browser-header-icon) {
  animation: 300ms ease scale-out forwards;
}

::view-transition-new(browser-header-title) {
  --slide-in-distance: 0.8rem;

  width: fit-content;
  height: fit-content;
  overflow: clip;
  object-fit: cover;
  animation: 200ms ease slide-in-left forwards;
}

::view-transition-old(browser-header-title) {
  --slide-in-distance: 0.8rem;

  width: fit-content;
  height: fit-content;
  object-fit: cover;
  animation: 200ms ease slide-out-right forwards;
}
</style>
