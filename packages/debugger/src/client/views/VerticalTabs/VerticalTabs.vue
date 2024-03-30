<script setup lang="ts">
import { ref } from 'vue';
import Button from '@components/Button/Button.vue';
import type { ButtonInstance } from '@components/Button/Button.types';
import Badge from '@components/Badge/Badge.vue';
import { useClassNames } from '@composables/useClassNames';
import type { VerticalTabsProps } from './VerticalTabs.types';
import { useVerticalTabs } from './useVerticalTabs';

const $class = useClassNames('vertical-tabs');
const props = defineProps<VerticalTabsProps>();

const tabButtonsRef = ref<(ButtonInstance | null)[]>([]);
const tabPanelsRef = ref<(HTMLElement | null)[]>([]);
const { menu, ids, tablistWidth, setActiveTab } = useVerticalTabs(props, tabButtonsRef);
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
        :id="ids.getTabButtonId(tab.id)"
        ref="tabButtonsRef"
        :key="ids.getTabButtonId(tab.id)"
        :class="[$class('button'), { active: menu.isActiveIndex(index) }]"
        :label="tab.label"
        :icon="tab.icon"
        :icon-only="iconOnly"
        :badge="tab.count ? tab.count : undefined"
        :aria-controls="ids.getTabPanelId(tab.id)"
        :aria-selected="menu.isActiveIndex(index)"
        role="tab"
        @click="setActiveTab(index)"
        @keydown="menu.handleKeydown"
      >
        <template
          v-if="tab.count"
          #after
        >
          <Badge
            :content="tab.count"
            :max="99"
          />
        </template>
      </Button>
      <div class="sep" />
    </div>
    <div :class="$class('content')">
      <div
        v-for="(tab, index) in tabs"
        :id="ids.getTabPanelId(tab.id)"
        ref="tabPanelsRef"
        :key="ids.getTabPanelId(tab.id)"
        :class="[$class('panel'), { active: menu.isActiveIndex(index) }]"
        :aria-labelledby="ids.getTabButtonId(tab.id)"
        tabindex="0"
        role="tabpanel"
      >
        <component
          :is="tab.component"
          v-if="menu.isActiveIndex(index)"
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

    .sep {
      height: 100%;
      background: var(--tablist-background-color);

      @include border-right;
    }

    .button {
      --button-height: 3.75rem;

      position: relative;
      justify-content: flex-start;
      width: 100%;
      margin-inline: 0;
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

        &:not(:focus) {
          outline-color: transparent;
          box-shadow: none;
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

        &::before {
          bottom: var(--radius-active);
          height: calc(100% - var(--radius-active));
        }
      }
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
