<script setup lang="ts">
import { inject } from 'vue';

import Button from '@components/Button/Button.vue';
import Badge from '@components/Badge/Badge.vue';
import Icon from '@components/Icon/Icon.vue';
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
  }

  a,
  button {
    @include button;
    @include button-medium;

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
        color: var(--accent-color-contrast);
        background: var(--accent-color);
      }
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
