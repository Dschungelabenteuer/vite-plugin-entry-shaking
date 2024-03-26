<script setup lang="ts">
import { computed, provide, reactive } from 'vue';
import { useMediaQuery } from '@vueuse/core';

import type { TransformData } from 'vite-plugin-entry-shaking';
import Input from '@components/Input/Input.vue';
import Button from '@components/Button/Button.vue';
import DropdownMenu from '@components/DropdownMenu/DropdownMenu.vue';
import { useClassNames } from '@composables/useClassNames';

import type { VerticalTab } from '@views/VerticalTabs/VerticalTabs.types';
import VerticalTabsView from '@views/VerticalTabs/VerticalTabs.vue';
import TransformMetrics from './details/TransformMetrics.vue';
import TransformDiffs from './details/TransformDiffs.vue';

export type TransformDetailsProps = {
  /** Transform path. */
  path?: string;
  /** Transform data. */
  transform?: TransformData;
};

type TransformDetailsEvents = {
  /** Emitted when the end of the tab list is reached. */
  'end-reached': [];
};

const $class = useClassNames('transform-details');
const emit = defineEmits<TransformDetailsEvents>();
const props = defineProps<TransformDetailsProps>();
const iconOnly = useMediaQuery('(max-width: 600px)');
provide('transform-details', reactive(props));

const tabs = computed<VerticalTab[]>(() => [
  {
    id: 'metrics',
    label: 'Metrics',
    icon: 'target-arrow',
    component: TransformMetrics,
  },
  {
    id: 'diffs',
    label: 'Diffs',
    icon: 'file-diff',
    component: TransformDiffs,
  },
]);

provide('depth', 1);
</script>

<template>
  <div :class="$class()">
    <div :class="$class('path')">
      <Input
        id="transform-path"
        :model-value="path"
        icon="file"
        label="Path"
        hide-label
      >
        <template #after>
          <Button
            icon="clipboard"
            :floating-placement="'bottom-end'"
            :icon-only="true"
            label="Copy file path"
          >
            <template #popover>
              <DropdownMenu
                :items="[
                  { label: 'Copy relative path', action: () => {} },
                  { label: 'Copy absolute path', action: () => {} },
                ]"
              />
            </template>
          </Button>
        </template>
      </Input>
    </div>
    <VerticalTabsView
      id="transform-details"
      label="Transform details"
      width="200px"
      min-content-width="400px"
      :icon-only="iconOnly"
      :tabs="tabs"
    />
  </div>
</template>

<style lang="scss">
.transform-details {
  display: grid;
  grid-template-rows: 3rem 1fr;
  grid-template-columns: 1fr;
  height: calc(100% + (var(--spacing-lg) * 2));
  margin: calc((var(--spacing-lg) * -1));
  overflow: hidden;

  &__path {
    @include border-bottom;
    @include padding(var(--spacing-sm), var(--spacing-xs));

    display: flex;
    align-items: center;
    width: 100%;

    svg {
      margin-inline-end: var(--spacing-md);
    }

    .input {
      width: 100%;
      font-family: monospace;

      &__wrapper {
        width: 100%;
      }

      &__container {
        flex-grow: 1;
      }
    }
  }
}
</style>
