<script setup lang="ts">
import { computed, inject, provide, reactive } from 'vue';
import { useMediaQuery } from '@vueuse/core';

import Input from '@components/Input/Input.vue';
import Button from '@components/Button/Button.vue';
import type { Toaster } from '@components/Toast/Toast.types';
import DropdownMenu from '@components/DropdownMenu/DropdownMenu.vue';
import { useClassNames } from '@composables/useClassNames';
import type { VerticalTab } from '@views/VerticalTabs/VerticalTabs.types';
import VerticalTabsView from '@views/VerticalTabs/VerticalTabs.vue';
import EntryMetrics from './details/EntryMetrics.vue';
import EntryDiffs from './details/EntryDiffs.vue';
import EntryExports from './details/EntryExports.vue';
import EntryWildcards from './details/EntryWildcards.vue';
import type { EntryDetailsEvents, EntryDetailsProps } from './Entries.types';

const $class = useClassNames('entry-details');
const emit = defineEmits<EntryDetailsEvents>();
const props = defineProps<EntryDetailsProps>();
const iconOnly = useMediaQuery('(max-width: 600px)');
const $toaster = inject<Toaster>('$toaster')!;
const tabs = computed<VerticalTab[]>(() => [
  {
    id: 'metrics',
    label: 'Metrics',
    icon: 'target-arrow',
    component: EntryMetrics,
  },
  {
    id: 'diffs',
    label: 'Diffs',
    icon: 'file-diff',
    component: EntryDiffs,
  },
  {
    id: 'exports',
    label: 'Exports',
    icon: 'package-export',
    count: props.entry?.exports.size,
    component: EntryExports,
  },
  {
    id: 'wildcards',
    label: 'Wildcards',
    icon: 'asterisk',
    count:
      (props.entry?.wildcardExports?.direct.length ?? 0) +
      (props.entry?.wildcardExports?.named.size ?? 0),
    component: EntryWildcards,
  },
]);

const copyAbsolutePath = () => {
  navigator.clipboard.writeText(props.entry?.path ?? '');
  $toaster.add({
    type: 'success',
    message: 'Copied absolute path to clipboard!',
  });
};

const copyRelativePath = () => {
  navigator.clipboard.writeText(props.entry?.relativePath ?? '');
  $toaster.add({
    type: 'success',
    message: 'Copied relative path to clipboard!',
  });
};

provide('entry-details', reactive(props));
provide('depth', 1);
</script>

<template>
  <div :class="$class()">
    <div :class="$class('path')">
      <Input
        id="entry-path"
        :model-value="path"
        icon="file"
        label="Path"
        hide-label
      >
        <template #after>
          <Button
            icon="clipboard"
            label="Dropdown"
            :icon-only="true"
          >
            <template #popover="{ isOpen, isTransitioning }">
              <DropdownMenu
                :is-open
                :is-transitioning
                :items="[
                  { label: 'Copy absolute path', action: copyAbsolutePath },
                  { label: 'Copy relative path', action: copyRelativePath },
                ]"
              />
            </template>
          </Button>
        </template>
      </Input>
    </div>
    <VerticalTabsView
      id="entry-details"
      label="Entry details"
      width="200px"
      min-content-width="400px"
      :icon-only="iconOnly"
      :tabs="tabs"
    />
  </div>
</template>

<style lang="scss">
.entry-details {
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
