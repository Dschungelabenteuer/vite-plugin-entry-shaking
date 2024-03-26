<script setup lang="ts">
import type { Ref } from 'vue';
import { computed, inject, ref } from 'vue';

import Popover from '@components/Popover/Popover.vue';
import { usePopover } from '@components/Popover/usePopover';
import Kbd from '@components/Kbd/Kbd.vue';
import type { ClassNameFn } from '@composables/useClassNames';
import type { ShortcutsHintProps } from './Shortcuts.types';

const $class = inject<ClassNameFn>('$class')!;
const props = defineProps<ShortcutsHintProps>();

const reference = inject<Ref<HTMLButtonElement | null>>('reference')!;
const tooltipRef = ref<InstanceType<typeof Popover> | null>(null);
const tooltip = usePopover(reference, tooltipRef);
const tooltipId = computed(() => `${props.id}-shortcuts-tooltip`);
</script>

<template>
  <Popover
    :id="tooltipId"
    ref="tooltipRef"
    :is-open="showTooltip ?? false"
    :style="tooltip.styles"
    @close="tooltip.close"
  >
    <div :class="$class('content')">
      <span>{{ message }}, </span>
      <span>press <Kbd content="H" /> to toggle controls.</span>
    </div>
  </Popover>
</template>
