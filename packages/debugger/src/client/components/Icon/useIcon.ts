import type { Ref } from 'vue';
import { computed, reactive } from 'vue';
import type Tooltip from '@components/Tooltip/Tooltip.vue';
import { useTooltip } from '@components/Tooltip/useTooltip';
import { useTeleport } from '@composables/useTeleport';
import type { IconProps } from './Icon.types';

export function useIcon(
  props: IconProps,
  reference: Ref<HTMLButtonElement | null>,
  tooltipRef: Ref<InstanceType<typeof Tooltip> | null>,
) {
  const tooltipOptions = computed(() => ({
    placement: props.tooltipOptions?.placement ?? 'top',
    ...(!props.tooltipOptions?.autoupdatePosition ? { whileElementsMounted: undefined } : {}),
  }));

  const set = 'tabler';
  const teleport = useTeleport();
  const tooltip = useTooltip(reference, tooltipRef, tooltipOptions.value);
  const icon = computed(() => `${set}:${props.name}`);

  return { icon, teleport, tooltip: reactive(tooltip) };
}
