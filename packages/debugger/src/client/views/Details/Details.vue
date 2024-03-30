<script setup lang="ts">
import { inject } from 'vue';
import { useMediaQuery } from '@vueuse/core';

import type { Toaster } from '@components/Toast/Toast.types';
import Input from '@components/Input/Input.vue';
import Button from '@components/Button/Button.vue';
import DropdownMenu from '@components/DropdownMenu/DropdownMenu.vue';
import { useClassNames } from '@composables/useClassNames';
import VerticalTabs from '@views/VerticalTabs/VerticalTabs.vue';
import { useDetails } from './useDetails';
import type { DetailsProps } from './Details.types';

const $class = useClassNames('details');
const props = defineProps<DetailsProps>();
const $toaster = inject<Toaster>('$toaster')!;
const details = useDetails(props, $toaster);
const iconOnly = useMediaQuery('(max-width: 600px)');
</script>

<template>
  <div :class="$class()">
    <div :class="$class('path')">
      <Input
        :id="details.pathInputId.value"
        :model-value="absolutePath"
        :readonly="true"
        icon="file"
        label="Path"
        hide-label
      >
        <template #after>
          <Button
            icon="clipboard"
            label="Copy file path"
            :icon-only="true"
          >
            <template #popover="{ isOpen, isTransitioning }">
              <DropdownMenu
                :is-open
                :is-transitioning
                :items="[
                  { label: 'Copy absolute path', action: details.copyAbsolutePath },
                  { label: 'Copy relative path', action: details.copyRelativePath },
                ]"
              />
            </template>
          </Button>
        </template>
      </Input>
    </div>
    <VerticalTabs
      :id="details.tabsContainerId.value"
      :label="tabsLabel"
      :width="tabsWidth"
      :min-content-width="tabsMinContentWidth"
      :icon-only="iconOnly"
      :tabs="tabs"
      :active-tab-id="activeTabId"
    />
  </div>
</template>

<style lang="scss">
.details {
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

    .input {
      width: 100%;
      font-family: monospace;

      &__wrapper {
        width: 100%;
      }

      &__container {
        flex-grow: 1;
      }

      &__icon {
        margin-inline-end: var(--spacing-md);
      }
    }
  }
}
</style>
