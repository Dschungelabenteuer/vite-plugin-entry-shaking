<script setup lang="ts">
import { inject, nextTick, ref, watch } from 'vue';
import Button from '@component/Button.vue';
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
          ref="closeBtnRef"
          size="large"
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
  max-width: 300px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: var(--size-header) 1fr var(--size-footer);

  &__backdrop {
    z-index: 10;
    background: rgba(0, 0, 0, 0.3);
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    backdrop-filter: var(--blur-lg);
    opacity: 0;
    transition: all ease var(--transition-duration-short);
  }

  &__content {
    display: grid;
    grid-template-rows: var(--size-header) 1fr var(--size-footer);
    z-index: 20;
    background: var(--overall-background-color);
    border-inline-start: 1px solid var(--overall-border-color);
    color: var(--text-color);
    height: 100vh;
    backdrop-filter: var(--blur-xl);
  }

  &__header {
    box-shadow: 0 0 0 1px var(--overall-border-color);
    display: flex;
    padding-block: 1.5px;
    align-items: center;

    > .icon-button {
      height: 100%;
    }

    h2 {
      font-size: 1.14rem;
      width: 100%;
      padding-inline-start: var(--spacing-md);
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
