<script setup lang="ts">
import { computed, useAttrs } from 'vue';

import Icon from '@components/Icon/Icon.vue';
import { useClassNames } from '@composables/useClassNames';
import type { KbdProps } from './Kbd.types';

const $class = useClassNames('kbd');
const props = defineProps<KbdProps>();

const classes = computed(() => [useAttrs().class, $class()]);

const items = computed(() => {
  const list = Array.isArray(props.content) ? props.content : [props.content];
  return list.map((item) => {
    switch (item) {
      case 'ArrowUp':
        return { component: Icon, icon: 'arrow-up' };
      case 'ArrowDown':
        return { component: Icon, icon: 'arrow-down' };
      case 'ArrowLeft':
        return { component: Icon, icon: 'arrow-left' };
      case 'ArrowRight':
        return { component: Icon, icon: 'arrow-right' };
      case 'Enter':
        return { component: Icon, icon: 'corner-down-left' };
      case 'Home':
        return { component: Icon, icon: 'home' };
      case 'End':
        return { component: 'span', name: item };
      case 'PageUp':
        return { component: Icon, icon: 'arrow-big-up-line' };
      case 'PageDown':
        return { component: Icon, icon: 'arrow-big-down-line' };
      default:
        return item.match(/^[a-zA-Z]{1}$/)
          ? { component: Icon, icon: `letter-${item.toLocaleLowerCase()}`, class: 'letter' }
          : { component: 'span', name: item };
    }
  });
});
</script>

<template>
  <template
    v-for="(k, i) in items"
    :key="k"
  >
    <kbd :class="classes">
      <component
        :is="k.component"
        :name="k.icon"
        :class="k.class"
      >
        {{ k.name }}
      </component>
    </kbd>
    <span
      v-if="i < items.length - 1"
      :class="$class('sep')"
      >+</span
    >
  </template>
</template>

<style lang="scss" data-desc="tokens">
@include color-scheme(light) {
  --kbd-opacity: 0.8;
  --kbd-opacity-dimmed: 0.5;
}

@include color-scheme(dark) {
  --kbd-opacity: 0.7;
  --kbd-opacity-dimmed: 0.3;
}
</style>

<style lang="scss" data-desc="styling">
.kbd {
  display: inline-flex;
  align-items: center;
  padding-block: var(--spacing-xs);
  padding-inline: var(--spacing-sm);
  margin-inline: var(--spacing-sm);
  font-family: monospace;
  font-size: var(--font-size-2xs);
  font-weight: 600;
  line-height: 1;
  color: var(--text-color);
  text-transform: uppercase;
  border-radius: var(--radius-md);
  box-shadow: inset 0 0 0 1px var(--text-color);
  opacity: var(--kbd-opacity);

  .letter {
    transform-origin: center center;
    scale: 0.85;
  }

  svg {
    display: inline-flex;
    align-items: center;
    transform: translateY(1px);
    transform-origin: center center;
    scale: 1.42;
  }
}
</style>

<style lang="scss" data-desc="variants">
.kbd {
  &.condensed {
    @include padding(var(--spacing-2xs), var(--spacing-xs));
  }

  &.dimmed {
    opacity: var(--kbd-opacity-dimmed);
  }
}
</style>
