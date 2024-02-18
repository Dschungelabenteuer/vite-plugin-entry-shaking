<script setup lang="ts">
import type { EntryData } from 'vite-plugin-entry-shaking';
import Button from '@component/Button.vue';
import Icon from '@component/Icon.vue';
import { useClassNames } from '@composable/useClassNames';
import type { GridRowProps } from '@views/GridView.vue';

type EntryProps = GridRowProps<
  EntryData & {
    /** Entry file path. */
    path: string;
  }
>;

type EntryEvents = {
  /** Emitted when the user clicks on the "view" button. */
  view: [path: string];
};

const $class = useClassNames('entry');
const emit = defineEmits<EntryEvents>();
const props = defineProps<EntryProps>();
</script>

<template>
  <div :class="$class('access')">
    <Button
      label="Details"
      icon="eye"
      :disable-tooltip="true"
      :icon-only="true"
      @click="emit('view', item.path)"
    />
  </div>
  <div :class="$class('time')">{{ item.time }}ms</div>
  <div :class="$class('self')">{{ item.self }}ms</div>
  <div :class="$class('is-implicit')">
    <div v-show="item.isImplicit">
      <Icon
        name="ghost-3"
        :tooltip="item.isImplicit ? 'Implicit entry' : undefined"
      />
    </div>
  </div>
  <div :class="$class('path')">
    <span>{{ item.path }}</span>
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
      box-shadow: 1px 0 0 0 var(--grid-header-border-color);
      left: 0;
      top: -3px;
      z-index: -1;
      opacity: 0.82;
    }

    button {
      font-size: var(--font-size-md);
    }
  }

  &__path {
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--font-size-sm);
    padding-inline: var(--spacing-lg);
  }

  &__time,
  &__self {
    font-family: monospace;
    font-size: var(--font-size-xs);
    text-align: center;
  }
}
</style>
