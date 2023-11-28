<script setup lang="ts">
import { inject } from 'vue';
import { Icon } from '@iconify/vue';
import Badge from './Badge.vue';
import { useNavigation } from '../composables/useNavigation';
import type { ExpectationsPanel } from '../composables/useExpectationsPanel';
import IconButton from './IconButton.vue';

const links = useNavigation();
const expectationsPanel = inject<ExpectationsPanel>('expectationsPanel')!;
const { toggle, isOpen, openBtnId } = expectationsPanel;
</script>

<template>
  <nav class="navigation">
    <ul>
      <li
        v-for="link in links"
        :key="link.href"
      >
        <router-link :to="link.href">
          <Icon
            v-if="link.icon"
            class="navigation__icon"
            :icon="`tabler:${link.icon}`"
          />
          {{ link.name }}
          <Badge
            v-if="link.count !== undefined"
            class="navigation__badge"
            :content="String(link.count)"
          />
        </router-link>
      </li>
      <li v-if="!isOpen">
        <IconButton
          :id="openBtnId"
          aria-controls="expectations-panel"
          aria-expanded="false"
          icon="tabler:arrow-bar-left"
          label="Show expectations"
          @click="toggle"
        />
      </li>
    </ul>
  </nav>
</template>

<style lang="scss">
@import '../styles/mixins';

.navigation,
.navigation *:not(.badge):not(.tooltip-wrapper) {
  height: 100%;
}

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
}
</style>
