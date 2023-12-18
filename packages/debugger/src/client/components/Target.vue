<script setup lang="ts">
import type { EntryData } from 'vite-plugin-entry-shaking';
import { computed, ref } from 'vue';
import { useFloating, autoUpdate, flip, shift } from '@floating-ui/vue';

import Button from './Button.vue';
import Tooltip from './Tooltip.vue';
import IconButton from './IconButton.vue';

export type TargetProps = EntryData & {
  path: string;
  relativePath: string;
};

const props = defineProps<TargetProps>();
const middleware = ref([flip(), shift()]);
const reference = ref<HTMLButtonElement | null>(null);
const floating = ref<InstanceType<typeof Tooltip> | null>(null);
const isOpen = ref(false);

const { floatingStyles } = useFloating(reference, floating, {
  whileElementsMounted: autoUpdate,
  middleware,
});

const targetExports = computed(() =>
  [...props.exports.entries()].map(([name, value]) => ({
    name,
    ...value,
  })),
);
</script>

<template>
  <div class="target">
    <IconButton
      icon="tabler:chevron-right"
      label="Show metrics"
    />
    <div
      ref="reference"
      class="target__rel"
      @mouseenter="isOpen = true"
      @mouseleave="isOpen = false"
    >
      {{ relativePath }}
      <Tooltip
        ref="floating"
        :is-open="isOpen"
        :style="floatingStyles"
      >
        {{ path }}
      </Tooltip>
    </div>
    <IconButton
      icon="tabler:copy"
      label="Show metrics"
    />
    <div class="target__actions">
      <Button
        label="Compare original/updated"
        icon="tabler:arrows-diff"
      />
    </div>
  </div>
  <div class="target__exports">
    <template
      v-for="targetExport in targetExports"
      :key="targetExport.name"
    >
      <div class="export__name">{{ targetExport.name }}</div>
      <div class="export__originalName">{{ targetExport.originalName }}</div>
      <div class="export__path">{{ targetExport.path }}</div>
      <div class="export__importDefault">{{ targetExport.importDefault }}</div>
    </template>
  </div>
</template>

<style lang="scss">
@import '../styles/mixins';

.target {
  @include flex(normal, center);
  @include border-bottom;
  padding: var(--spacing-md);
  position: relative;

  &__rel {
    font-weight: 600;
  }

  &__exports {
    display: grid;
    align-items: center;
    grid-template-columns: repeat(4, 1fr);
    padding-inline: var(--spacing-md);
    @include border-bottom;
  }
}
</style>
