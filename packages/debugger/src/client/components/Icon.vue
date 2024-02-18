<script setup lang="ts">
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import type { UseFloatingOptions } from '@floating-ui/vue';
import { useTooltip } from '@composable/useTooltip';
import Tooltip from './Tooltip.vue';

type IconProps = {
  /** Icon name. */
  name: string;
  /** Tooltip attached to the icon. */
  tooltip?: string;
  /** Should we disable tooltip position's autoupdate? */
  autoupdateFloatingPosition?: boolean;
};

const props = withDefaults(defineProps<IconProps>(), {
  tooltip: undefined,
  autoupdateFloatingPosition: true,
});

const reference = ref<HTMLButtonElement | null>(null);
const tooltipRef = ref<InstanceType<typeof Tooltip> | null>(null);
const tooltipOptions = computed<UseFloatingOptions>(() =>
  props.autoupdateFloatingPosition ? {} : { whileElementsMounted: undefined },
);

const {
  isOpen: isTooltipOpen,
  styles: tooltipStyles,
  handlers: tooltipHandlers,
} = useTooltip(reference, tooltipRef, tooltipOptions.value);

const set = 'tabler';
const icon = computed(() => `${set}:${props.name}`);
</script>

<template>
  <span>
    <template v-if="!tooltip">
      <Icon :icon="icon" />
    </template>
    <span
      v-else
      v-on="tooltipHandlers"
    >
      <Icon
        ref="reference"
        :icon="icon"
      />
    </span>
    <Tooltip
      ref="tooltipRef"
      :is-open="isTooltipOpen"
      :style="tooltipStyles"
    >
      {{ tooltip }}
    </Tooltip>
    <span
      v-if="tooltip"
      class="sr-only"
      >Implicit entry</span
    >
  </span>
</template>

<style></style>
