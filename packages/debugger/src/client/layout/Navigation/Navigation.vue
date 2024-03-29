<script setup lang="ts">
import { inject } from 'vue';

import Button from '@components/Button/Button.vue';
import RouterButton from '@components/RouterButton/RouterButton.vue';
import { useClassNames } from '@composables/useClassNames';
import type { Panel } from '@views/Panel/Panel.types';
import { useNavigation } from './useNavigation';

const $class = useClassNames('navigation');
const links = useNavigation();
const metricsPanel = inject<Panel>('metricsPanel')!;
const { toggle, isOpen, openBtnId } = metricsPanel;
</script>

<template>
  <nav :class="$class()">
    <ul>
      <li
        v-for="link in links"
        :key="link.href"
      >
        <RouterButton
          :href="link.href"
          :icon="link.icon"
          :label="link.name"
          :count="link.count"
        />
      </li>
      <li
        v-if="!isOpen"
        class="metrics-btn"
      >
        <Button
          :id="openBtnId"
          aria-controls="metrics-panel"
          aria-expanded="false"
          icon="arrow-bar-left"
          :icon-only="true"
          label="Open metrics panel"
          class="large"
          @click="toggle"
        />
      </li>
    </ul>
  </nav>
</template>

<style lang="scss">
.navigation {
  ul {
    @include flex;
    @include reset-list;
  }

  li {
    position: relative;
    font-size: var(--font-size-sm);

    .button {
      font-size: var(--font-size-sm);
    }
  }

  .metrics-btn[disabled='true'] {
    display: none;
    min-width: 1rem;
  }

  @media (max-width: $breakpoint-md) {
    .metrics-btn[disabled] {
      display: initial;
    }
  }
}
</style>
