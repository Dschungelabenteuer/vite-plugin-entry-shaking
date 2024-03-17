<script setup lang="ts">
import type { Component, DefineComponent } from 'vue';
import { computed, nextTick, ref } from 'vue';
import Button from '@component/Button/Button.vue';
import { useClassNames } from '@composable/useClassNames';
import { useViewTransition } from '@composable/useViewTransition';

export type VerticalTab = {
  /** Tab ID. */
  id: string;
  /** Tab label. */
  label: string;
  /** Tab icon. */
  icon: string;
  /** Tab item count. */
  count?: number;
  /** Tab content component. */
  component: Component | DefineComponent;
};

type VerticalTabsProps = {
  /** Tablist ID. */
  id: string;
  /** Tablist label. */
  label: string;
  /** Tablist width. */
  width: string;
  /** List of tabs. */
  tabs: VerticalTab[];
  /** Should we only show the icon of tab buttons? */
  iconOnly?: boolean;
};

const $class = useClassNames('vertical-tabs');
const props = defineProps<VerticalTabsProps>();
const { transition } = useViewTransition({});

const tabButtonsRef = ref<(InstanceType<typeof Button> | null)[]>([]);
const tabPanelsRef = ref<(HTMLElement | null)[]>([]);
const activeIndex = ref<number>(0);
const prefix = computed(() => `tabs_${props.id}`);
const getTabId = (tabId: VerticalTab['id']) => `${prefix.value}_${tabId}`;
const getTabPanelId = (tabId: VerticalTab['id']) => `${getTabId(tabId)}_tab`;
const getTabButtonId = (tabId: VerticalTab['id']) => `${getTabId(tabId)}_btn`;
const tablistWidth = computed(() => (props.iconOnly ? 'auto' : props.width));
const setActiveTab = async (index: number) => {
  if (index === activeIndex.value) return;
  await transition();
  activeIndex.value = index;
  nextTick(() => {
    tabButtonsRef.value[index]?.reference?.focus();
  });
};

const firstTab = () => setActiveTab(0);
const lastTab = () => setActiveTab(props.tabs.length - 1);
const prevTab = () => (activeIndex.value === 0 ? lastTab() : setActiveTab(activeIndex.value - 1));
const nextTab = () =>
  activeIndex.value === props.tabs.length - 1 ? firstTab() : setActiveTab(activeIndex.value + 1);

const handleTab = (e: KeyboardEvent) => {
  e.preventDefault();
  e.stopPropagation();
  tabPanelsRef.value[activeIndex.value]?.focus();
};
</script>

<template>
  <div :class="$class()">
    <div
      :class="$class('tablist')"
      :aria-labelledby="label"
      role="tablist"
    >
      <Button
        v-for="(tab, index) in tabs"
        :id="getTabButtonId(tab.id)"
        ref="tabButtonsRef"
        :key="getTabButtonId(tab.id)"
        :class="[$class('button'), { active: activeIndex === index }]"
        :label="tab.label"
        :icon="tab.icon"
        :icon-only="iconOnly"
        :tabindex="activeIndex === index ? 0 : -1"
        :badge="tab.count ? String(tab.count) : undefined"
        :aria-controls="getTabPanelId(tab.id)"
        :aria-selected="activeIndex === index"
        role="tab"
        @click="setActiveTab(index)"
        @arrow-up="prevTab"
        @arrow-left="prevTab"
        @arrow-right="nextTab"
        @arrow-down="nextTab"
        @page-up="firstTab"
        @page-down="lastTab"
        @key-home="firstTab"
        @key-end="lastTab"
        @tab="handleTab"
      />
      <div class="sep" />
    </div>
    <div :class="$class('content')">
      <div
        v-for="(tab, index) in tabs"
        :id="getTabPanelId(tab.id)"
        ref="tabPanelsRef"
        :key="getTabPanelId(tab.id)"
        :class="[$class('panel'), { active: activeIndex === index }]"
        :aria-labelledby="getTabButtonId(tab.id)"
        tabindex="0"
        role="tabpanel"
      >
        <component
          :is="tab.component"
          v-if="activeIndex === index"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@include color-scheme(light) {
  --tablist-background-color: color-mix(in srgb, var(--background-color-alt) 10%, #fff);
}

@include color-scheme(dark) {
  --tablist-background-color: var(--overall-background-color);
}

.vertical-tabs {
  display: flex;
  overflow: hidden;

  --radius-active: calc((var(--radius-md) + 6px));

  &__tablist {
    display: flex;
    flex-direction: column;
    width: v-bind(tablistWidth);
    margin: 1px 0;

    .button {
      position: relative;
      justify-content: flex-start;
      width: 100%;
      font-size: var(--font-size-sm);
      background: var(--tablist-background-color);
      border-radius: 0;

      svg {
        font-size: var(--font-size-xl);
      }

      &::before,
      &::after {
        position: absolute;
        right: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        content: '';
        opacity: 0;
      }

      &::before {
        bottom: 0;
        opacity: 1;

        @include border-right;
      }

      &.active {
        color: var(--text-emphasize-color);
        background: transparent;

        &:first-child {
          &::before {
            display: none;
          }
        }

        &:last-child {
          &::after {
            display: none;
          }
        }

        &::after {
          inset-inline-end: -1px;
          top: calc(100% - 1px);
          height: var(--radius-active);
          border-inline-end: 1px solid var(--overall-border-color);
          border-start-end-radius: var(--radius-active);
          box-shadow: inset 0 1px 0 0 var(--overall-border-color);
          opacity: 1;
        }

        &::before {
          inset-inline-end: -1px;
          bottom: 100%;
          height: var(--radius-active);
          border-inline-end: 1px solid var(--overall-border-color);
          border-end-end-radius: var(--radius-active);
          box-shadow:
            inset 0 -1px 0 0 var(--overall-border-color),
            inset 0 -2px 4px 0 #00000008;
        }

        + .button {
          border-start-end-radius: var(--radius-active);
          box-shadow: inset 0 2px 4px 0 #00000008;

          &::before {
            top: var(--radius-active);
            height: calc(100% - var(--radius-active));
          }
        }

        + .sep {
          border-start-end-radius: var(--radius-active);
          box-shadow:
            1px 0 0 0 var(--overall-border-color),
            inset 0 2px 4px 0 #00000008;
        }
      }

      &:has(+ .button.active) {
        border-end-end-radius: var(--radius-active);

        &:first-child {
        }

        &::before {
          bottom: var(--radius-active);
          height: calc(100% - var(--radius-active));
        }
      }
    }

    .sep {
      height: 100%;
      background: var(--tablist-background-color);

      @include border-right;
    }
  }

  &__content {
    width: 100%;
    margin: 1px;
    overflow: auto;
  }

  &__panel {
    position: relative;
    display: none;

    &.active {
      display: initial;
    }
  }
}
</style>
