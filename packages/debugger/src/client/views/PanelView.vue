<script setup lang="ts">
import { inject, nextTick, ref, watch } from 'vue';
import Button from '@component/Button/Button.vue';
import type { Panel } from '@composable/usePanel';
import { useClassNames } from '@composable/useClassNames';

type PanelProps = {
  /** Panel ID. */
  panelId: string;
  /** Panel title. */
  title: string;
  /** Close panel label. */
  closePanelLabel: string;
};

const $class = useClassNames('panel');
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
</script>

<template>
  <div
    :id="panelId"
    role="region"
    :class="$class()"
  >
    <div :class="$class('content')">
      <header :class="$class('header')">
        <Button
          v-if="isOpen"
          ref="closeBtnRef"
          class="size"
          :aria-controls="panelId"
          :aria-expanded="true"
          icon="arrow-bar-right"
          :icon-only="true"
          :label="closePanelLabel"
          @click="toggle"
        />
        <h2>Metrics</h2>
      </header>
      <slot />
      <footer :class="$class('footer')">
        <slot name="footer" />
      </footer>
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

  &__header {
    display: flex;
    align-items: center;
    padding-block: 1.5px;
    box-shadow: 0 0 0 1px var(--overall-border-color);

    h2 {
      width: 100%;
      padding-inline-start: var(--spacing-md);
      font-size: 1.14rem;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 1px var(--overall-border-color);

    > * {
      margin-inline: var(--spacing-sm);
    }
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
