<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { Icon } from '@iconify/vue';
import Tooltip from '@components/Tooltip/Tooltip.vue';

import type { IconProps } from './Icon.types';
import { useIcon } from './useIcon';

const props = withDefaults(defineProps<IconProps>(), {
  tooltip: undefined,
  tooltipOptions: () => ({ placement: 'top', autoupdatePosition: true, disable: false }),
});

const reference = useTemplateRef<HTMLButtonElement>('reference');
const tooltipRef = useTemplateRef<InstanceType<typeof Tooltip>>('tooltipRef');
const { icon, tooltip, teleport } = useIcon(props, reference, tooltipRef);
</script>

<template>
  <span>
    <template v-if="!props.tooltip">
      <Icon :icon="icon" />
    </template>
    <span
      v-else
      v-on="tooltip.handlers"
    >
      <Icon
        ref="reference"
        :icon="icon"
      />
    </span>
    <Teleport
      defer
      :disabled="teleport.disabled.value"
      :to="teleport.to.value"
    >
      <Tooltip
        v-if="props.tooltip"
        ref="tooltipRef"
        :is-open="tooltip.isOpen"
        :style="tooltip.styles"
      >
        {{ props.tooltip }}
      </Tooltip>
    </Teleport>
    <span
      v-if="tooltip"
      class="sr-only"
    >
      Implicit entry
    </span>
  </span>
</template>
