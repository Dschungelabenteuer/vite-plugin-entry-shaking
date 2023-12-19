<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref, useAttrs } from 'vue';
import { useFloating, autoUpdate, flip, shift } from '@floating-ui/vue';
import Tooltip from './Tooltip.vue';

type Booleanish = 'true' | 'false';
type IconButtonProps = {
  icon: string;
  label: string;
  size?: 'medium' | 'large';
};

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<IconButtonProps>(), {
  size: 'medium',
});

const emit = defineEmits<{ click: [] }>();
const attrs = useAttrs();
const middleware = ref([flip(), shift()]);
const reference = ref<HTMLButtonElement | null>(null);
const floating = ref<InstanceType<typeof Tooltip> | null>(null);
const isOpen = ref(false);
const id = computed(() => attrs['id'] as string);
const ariaControls = computed(() => attrs['aria-expanded'] as string);
const ariaExpanded = computed(() => attrs['aria-expanded'] as Booleanish);
const classes = computed(() => ['icon-button', props.size]);

const { floatingStyles } = useFloating(reference, floating, {
  whileElementsMounted: autoUpdate,
  middleware,
});

defineExpose({ reference });
</script>

<template>
  <button
    :id="id"
    ref="reference"
    :class="classes"
    :aria-label="label"
    :aria-expanded="ariaExpanded"
    :aria-controls="ariaControls"
    @click="emit('click')"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
    @focus="isOpen = true"
    @blur="isOpen = false"
  >
    <Icon :icon="icon" />
  </button>
  <Tooltip
    ref="floating"
    :is-open="isOpen"
    :style="floatingStyles"
  >
    {{ label }}
  </Tooltip>
</template>

<style lang="scss">
@import '../styles/mixins';

.icon-button {
  @include button;

  &.medium {
    @include button-medium;
  }

  &.large {
    @include button-large;
  }
}
</style>
