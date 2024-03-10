<script setup lang="ts">
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { useTooltip } from '@composable/useTooltip';
import { useTeleport } from '@composable/useTeleport';
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
const tooltipOptions = computed(() => ({
  ...(!props.autoupdateFloatingPosition ? { whileElementsMounted: undefined } : {}),
}));

const {
  isOpen: isTooltipOpen,
  styles: tooltipStyles,
  handlers: tooltipHandlers,
} = useTooltip(reference, tooltipRef, tooltipOptions.value);
const teleport = useTeleport();

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
    <Teleport
      :disabled="teleport.disabled.value"
      :to="teleport.to.value"
    >
      <Tooltip
        v-if="tooltip"
        ref="tooltipRef"
        :is-open="isTooltipOpen"
        :style="tooltipStyles"
      >
        {{ tooltip }}
      </Tooltip>
    </Teleport>
    <span
      v-if="tooltip"
      class="sr-only"
      >Implicit entry</span
    >
  </span>
</template>

<style></style>
