<script setup lang="ts">
import { inject } from 'vue';

import Button from '@component/Button.vue';
import Badge from '@component/Badge.vue';
import Icon from '@component/Icon.vue';
import type { Panel } from '@composable/usePanel';
import { useNavigation } from '@composable/useNavigation';
import { useClassNames } from '@composable/useClassNames';

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
        <router-link :to="link.href">
          <Icon
            v-if="link.icon"
            :class="$class('icon')"
            :name="link.icon"
          />
          {{ link.name }}
          <Badge
            v-if="link.count !== undefined"
            :class="$class('badge')"
            :content="String(link.count)"
          />
        </router-link>
      </li>
      <li
        class="metrics-btn"
        :disabled="isOpen"
      >
        <Button
          :id="openBtnId"
          aria-controls="metrics-panel"
          aria-expanded="false"
          icon="arrow-bar-left"
          :icon-only="true"
          label="Open metrics panel"
          size="large"
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
  }

  a,
  button {
    @include button;
    @include button-large;
    transition: ease var(--transition-duration-short);
  }

  &__icon {
    margin-inline-end: var(--spacing-md);
    font-size: var(--font-size-md);
    opacity: 0.6;
  }

  &__badge {
    margin-inline-start: var(--spacing-md);
  }

  a.router-link-active {
    color: var(--accent-color);

    .navigation {
      &__icon {
        opacity: 1;
      }

      &__badge {
        background: var(--accent-color);
        color: var(--accent-color-contrast);
      }
    }
  }

  .metrics-btn[disabled='true'] {
    min-width: 1rem;
    display: none;
  }

  @media (max-width: $breakpoint-md) {
    .metrics-btn[disabled] {
      display: initial;
    }
  }
}
</style>
