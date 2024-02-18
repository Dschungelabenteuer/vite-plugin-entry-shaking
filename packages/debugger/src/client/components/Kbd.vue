<script setup lang="ts">
import { computed } from 'vue';
import { useClassNames } from '@composable/useClassNames';
import Icon from './Icon.vue';

type KbdProps = {
  /** Content of the kbd. */
  content: string | string[];
  /** Should we dimm the kbd ? */
  dimmed?: boolean;
};

const $class = useClassNames('kbd');
const props = defineProps<KbdProps>();

const classes = computed(() => [$class(), props.dimmed ? 'dimmed' : '']);
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

<style lang="scss">
@include color-scheme(light) {
  --kbd-opacity: 0.8;
  --kbd-opacity-dimmed: 0.5;
}

@include color-scheme(dark) {
  --kbd-opacity: 0.7;
  --kbd-opacity-dimmed: 0.3;
}

.kbd {
  border-radius: var(--radius-md);
  box-shadow: inset 0 0 0 1px var(--text-color);
  text-transform: uppercase;
  margin-inline: var(--spacing-sm);
  font-size: var(--font-size-2xs);
  font-weight: 600;
  font-family: monospace;
  color: var(--text-color);
  opacity: var(--kbd-opacity);
  @include padding(var(--spacing-sm), var(--spacing-sm));

  &.dimmed {
    opacity: var(--kbd-opacity-dimmed);
  }

  .letter {
    scale: 1.25;
    transform: translateY(1.5px);
  }

  svg {
    display: inline-flex;
    align-items: center;
    scale: 1.42;
    transform-origin: center center;
    transform: translateY(1px);
  }
}
</style>
