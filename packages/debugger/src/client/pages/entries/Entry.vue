<script setup lang="ts">
import { computed } from 'vue';

import { formatDuration } from '#utils';
import Button from '@components/Button/Button.vue';
import Icon from '@components/Icon/Icon.vue';
import { useClassNames } from '@composables/useClassNames';
import type { EntryEvents, EntryProps } from './Entries.types';

const $class = useClassNames('entry');
const emit = defineEmits<EntryEvents>();
const props = defineProps<EntryProps>();
const totalTime = computed(() => formatDuration(props.item.time));
const selfTime = computed(() => formatDuration(props.item.self));
</script>

<template>
  <div :class="$class('access')">
    <Button
      label="Details"
      icon="eye"
      :tooltip-options="{ disabled: true }"
      :icon-only="true"
      @click="emit('view', item.absolutePath)"
    />
  </div>
  <div :class="$class('time')">{{ totalTime }}</div>
  <div :class="$class('self')">{{ selfTime }}</div>
  <div :class="$class('is-implicit')">
    <div v-show="item.isImplicit">
      <Icon
        name="ghost-3"
        :tooltip="item.isImplicit ? 'Implicit entry' : undefined"
      />
    </div>
  </div>
  <div :class="$class('path')">
    <span>{{ item.relativePath }}</span>
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
  white-space: nowrap;

  &__access {
    position: sticky;
    bottom: 0;
    left: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    width: 100%;
    height: calc(100% - 2px) !important;

    /* backdrop-filter: blur(3px); // perf issue */

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      content: '';
      background: var(--entry-fixed-action-background-tint);
      background-attachment: fixed;
      background-position: left center;
      background-size: 100vw 100vh;
      box-shadow: 1px 0 0 0 var(--grid-header-border-color);
      opacity: 0.82;
    }

    button {
      font-size: var(--font-size-md);
    }
  }

  &__path {
    padding-inline: var(--spacing-lg);
    overflow: hidden;
    font-family: monospace;
    font-size: var(--font-size-sm);
    text-overflow: ellipsis;
  }

  &__time,
  &__self {
    font-family: monospace;
    font-size: var(--font-size-xs);
    text-align: center;
  }
}
</style>
