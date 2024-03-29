<script setup lang="ts">
import { computed, provide, reactive } from 'vue';

import type { TransformData } from 'vite-plugin-entry-shaking';

import type { VerticalTab } from '@views/VerticalTabs/VerticalTabs.types';
import Details from '@views/Details/Details.vue';
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

const emit = defineEmits<TransformDetailsEvents>();
const props = defineProps<TransformDetailsProps>();
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
  <Details
    id="transform-details"
    :absolute-path="String(path)"
    :relative-path="String(path)"
    :tabs
    tabs-label="Transform  details"
    tabs-width="200px"
    tabs-min-content-width="400px"
  />
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
