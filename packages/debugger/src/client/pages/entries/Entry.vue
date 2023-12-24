<script setup lang="ts">
import { computed } from 'vue';

import type { EntryData } from 'vite-plugin-entry-shaking';
import type { Column } from '@views/ScrollableView.vue';
import Button from '@component/Button.vue';

export type EntryProps = EntryData & {
  /** Path to entry. */
  path: string;
  /** Columns. */
  columns: Column[];
};

const props = defineProps<EntryProps>();

const gridTemplateColumns = computed(() => props.columns.map((column) => column.width).join(' '));

const entryClass = computed(() => ['entry']);
</script>

<template>
  <div :class="entryClass">
    <div class="entry__access">
      <Button
        label="Details"
        icon="eye"
        :icon-only="true"
        :disable-tooltip="true"
      />
    </div>
    <div class="entry__path">
      <span>{{ path }}</span>
    </div>
    <div class="entry__referer">
      <span>{{ path }}</span>
    </div>
    <div class="entry__exports-count">{{ exports.size }}</div>
    <div class="entry__wildcards-count">
      Aliased: {{ wildcardExports?.named.size }} Direct: {{ wildcardExports?.direct.length }}
    </div>
    <div class="entry__actions">aaa</div>
  </div>
</template>

<style lang="scss">
@include color-scheme(light) {
  --entry-fixed-action-background-tint: transparent;
}

@include color-scheme(dark) {
  --entry-fixed-action-background-tint: var(--background-gradient);
}

.entry {
  display: grid;
  grid-template-columns: v-bind(gridTemplateColumns);
  align-items: center;
  height: 2.75rem;
  padding-block: var(--spacing-sm);
  white-space: nowrap;
  @include border-bottom;

  &__access {
    z-index: 10;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    position: sticky;
    left: 0;
    backdrop-filter: blur(3px);

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: calc(100% + 3px);
      background: var(--entry-fixed-action-background-tint);
      background-position: left center;
      background-attachment: fixed;
      background-size: 100vw 100vh;
      box-shadow: 1px 0 0 0 var(--scrollable-header-border-color);
      left: 0;
      top: -3px;
      z-index: -1;
      opacity: 0.82;
    }

    button {
      font-size: var(--font-size-md);
    }
  }

  &__path,
  &__referer {
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--font-size-sm);
    padding-inline: var(--spacing-lg);
    span {
      direction: ltr;
    }
  }

  &__level {
    font-size: var(--font-size-lg);
    text-align: center;
    min-width: 1.325rem;
    margin-inline: calc(var(--spacing-md) + 3px) var(--spacing-md);
    position: relative;
  }
}
</style>
