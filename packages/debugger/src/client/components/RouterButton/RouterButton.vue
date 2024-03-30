<script setup lang="ts">
import Button from '@components/Button/Button.vue';
import Badge from '@components/Badge/Badge.vue';
import type { RouterButtonProps } from './RouterButton.types';

const props = defineProps<RouterButtonProps>();
</script>

<template>
  <router-link
    v-slot="{ isActive, navigate }"
    :to="href"
    custom
  >
    <Button
      :label="label"
      :icon="icon"
      :class="{ active: isActive }"
      @click="navigate"
    >
      <template
        v-if="count !== undefined"
        #after
      >
        <Badge
          v-if="count !== undefined"
          :content="count"
        />
      </template>
    </Button>
  </router-link>
</template>

<style lang="scss">
.button {
  &.active {
    color: var(--accent-color);

    &:not(:focus) {
      outline: none;
      box-shadow: none;
    }

    .badge {
      color: var(--accent-color-contrast);
      background: var(--accent-color);
    }
  }
}
</style>
