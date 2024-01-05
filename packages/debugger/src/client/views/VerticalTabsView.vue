<script setup lang="ts">
import type { Component, DefineComponent } from 'vue';
import { computed, nextTick, ref } from 'vue';
import { useClassNames } from '@composable/useClassNames';
import { getFocusableChildren } from '@composable/useFocusTrap';
import Button from '@component/Button.vue';

export type VerticalTab = {
  /** Tab ID. */
  id: string;
  /** Tab label. */
  label: string;
  /** Tab icon. */
  icon: string;
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

const tabButtonsRef = ref<(InstanceType<typeof Button> | null)[]>([]);
const tabPanelsRef = ref<(HTMLElement | null)[]>([]);
const activeIndex = ref<number>(0);
const prefix = computed(() => `tabs_${props.id}`);
const getTabId = (tabId: VerticalTab['id']) => `${prefix.value}_${tabId}`;
const getTabPanelId = (tabId: VerticalTab['id']) => `${getTabId(tabId)}_tab`;
const getTabButtonId = (tabId: VerticalTab['id']) => `${getTabId(tabId)}_btn`;
const tablistWidth = computed(() => (props.iconOnly ? 'auto' : props.width));
const setActiveTab = (index: number) => {
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
        :aria-controls="getTabPanelId(tab.id)"
        :aria-selected="activeIndex === index"
        role="tab"
        @click="activeIndex = index"
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
        <component :is="tab.component" />
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
      font-size: var(--font-size-sm);
      width: 100%;
      justify-content: flex-start;
      border-radius: 0;
      background: var(--tablist-background-color);

      svg {
        font-size: var(--font-size-xl);
      }

      &::before,
      &::after {
        content: '';
        position: absolute;
        right: 0;
        height: 100%;
        width: 100%;
        opacity: 0;
        pointer-events: none;
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
          top: calc(100% - 1px);
          height: var(--radius-active);
          box-shadow: inset 0 1px 0 0 var(--overall-border-color);
          border-inline-end: 1px solid var(--overall-border-color);
          inset-inline-end: -1px;
          border-start-end-radius: var(--radius-active);
          opacity: 1;
        }

        &::before {
          height: var(--radius-active);
          bottom: 100%;
          box-shadow:
            inset 0 -1px 0 0 var(--overall-border-color),
            inset 0px -2px 4px 0 #00000008;
          border-inline-end: 1px solid var(--overall-border-color);
          inset-inline-end: -1px;
          border-end-end-radius: var(--radius-active);
        }

        + .button {
          border-start-end-radius: var(--radius-active);
          box-shadow: inset 0px 2px 4px 0 #00000008;

          &::before {
            height: calc(100% - var(--radius-active));
            top: var(--radius-active);
          }
        }

        + .sep {
          box-shadow:
            1px 0 0 0 var(--overall-border-color),
            inset 0px 2px 4px 0 #00000008;
          border-start-end-radius: var(--radius-active);
        }
      }

      &:has(+ .button.active) {
        border-end-end-radius: var(--radius-active);

        &:first-child {
        }

        &::before {
          height: calc(100% - var(--radius-active));
          bottom: var(--radius-active);
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
    display: none;
    position: relative;

    &.active {
      display: initial;
    }
  }
}
</style>
