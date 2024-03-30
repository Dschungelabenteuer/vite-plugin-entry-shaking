<script setup lang="ts">
import { inject, nextTick, provide, ref, watch } from 'vue';
import type Button from '@components/Button/Button.vue';
import { useClassNames } from '@composables/useClassNames';
import type { PanelSlots, PanelProps, Panel } from './Panel.types';
import PanelHeader from './PanelHeader.vue';
import PanelFooter from './PanelFooter.vue';

const $class = useClassNames('panel');
const slots = defineSlots<PanelSlots>();
const props = defineProps<PanelProps>();

const closeBtnRef = ref<InstanceType<typeof Button> | null>(null);
const metricsPanel = inject<Panel>('metricsPanel')!;
const { toggle, openBtnId, isOpen } = metricsPanel;

watch(isOpen, (open) => {
  nextTick(() => {
    const el = open ? closeBtnRef.value?.reference : document.getElementById(openBtnId);
    if (el) (el as HTMLElement).focus();
  });
});

provide('$class', $class);
</script>

<template>
  <div
    :id="panelId"
    role="region"
    :class="$class()"
  >
    <div :class="$class('content')">
      <PanelHeader
        :panel-id
        :close-panel-label
        :is-open
        :toggle
      />
      <slot />
      <PanelFooter>
        <template #footer>
          <slot name="footer" />
        </template>
      </PanelFooter>
    </div>
    <div
      :class="$class('backdrop')"
      @click="toggle"
    />
  </div>
</template>

<style lang="scss">
.panel {
  @include contained;

  display: grid;
  grid-template-rows: var(--size-header) 1fr var(--size-footer);
  grid-template-columns: 1fr;
  max-width: 300px;
  overflow: visible;

  &__backdrop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    background: rgb(0 0 0 / 30%);
    backdrop-filter: var(--blur-lg);
    opacity: 0;
    transition: all ease var(--transition-duration-short);
  }

  &__content {
    z-index: 20;
    display: grid;
    grid-template-rows: var(--size-header) 1fr var(--size-footer);
    height: 100vh;
    color: var(--text-color);
    background: var(--overall-background-color);
    backdrop-filter: var(--blur-xl);
    border-inline-start: 1px solid var(--overall-border-color);
  }

  @media (max-width: $breakpoint-md) {
    position: absolute;
    inset-inline-end: 0;

    &__backdrop {
      pointer-events: all;
      opacity: 1;
    }
  }
}
</style>
