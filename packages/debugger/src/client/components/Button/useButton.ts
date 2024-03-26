import type { Ref } from 'vue';
import { computed, reactive, useAttrs, useSlots } from 'vue';

import { randomId } from '#utils';
import type { Booleanish, ShortEmits } from '#uitypes';
import type Tooltip from '@components/Tooltip/Tooltip.vue';
import type Popover from '@components/Popover/Popover.vue';
import { useTooltip } from '@components/Tooltip/useTooltip';
import { usePopover } from '@components/Popover/usePopover';
import { useTeleport } from '@composables/useTeleport';
import type { UseFloatingReturn } from '@composables/useFloating';
import type { ButtonEvents, ButtonProps } from './Button.types';

export function useButton(
  props: ButtonProps,
  emit: ShortEmits<ButtonEvents>,
  className: string,
  reference: Ref<HTMLButtonElement | null>,
  tooltipRef: Ref<InstanceType<typeof Tooltip> | null>,
  popoverRef: Ref<InstanceType<typeof Popover> | null>,
) {
  const tooltipOptions = computed(() => ({
    placement: props.tooltipOptions?.placement ?? 'top',
    ...(!props.tooltipOptions?.autoupdatePosition ? { whileElementsMounted: undefined } : {}),
  }));

  const tooltip = useTooltip(reference, tooltipRef, tooltipOptions.value);
  const popover = usePopover(reference, popoverRef);
  const teleport = useTeleport();
  const attributes = useButtonAttributes(props, className, popover);
  const handlers = useButtonHandlers(emit, tooltip, popover);

  return {
    /** HTML Attributes.  */
    attributes,
    /** Special handlers to be attached to the button. */
    handlers,
    /** Teleport parameters for tooltip. */
    teleport,
    /** Tooltip. */
    tooltip: reactive(tooltip),
    /** Popover. */
    popover: reactive(popover),
  };
}

function useButtonAttributes(props: ButtonProps, className: string, popover: UseFloatingReturn) {
  const attrs = useAttrs();
  const slots = useSlots();
  const id = computed(() => (attrs['id'] as string) ?? randomId('btn'));
  const ariaLabel = computed(() => attrs['aria-label'] as string | undefined);
  const tabindex = computed(() => attrs['tabindex'] as number | undefined);
  const popoverId = computed(() => `${id.value}-popover`);
  const classes = computed(() => [attrs.class ?? '', className, { 'icon-only': props.iconOnly }]);

  const ariaControls = computed(() =>
    slots.popover ? popoverId.value : (attrs['aria-controls'] as string),
  );

  const ariaExpanded = computed(
    () => (slots.popover ? popover.isOpen : attrs['aria-expanded']) as Booleanish,
  );

  return reactive({
    id,
    ariaLabel,
    ariaControls,
    ariaExpanded,
    tabindex,
    popoverId,
    title: props.disabled && typeof props.disabled === 'string' ? props.disabled : undefined,
    class: classes,
  });
}

function useButtonHandlers(
  emit: ShortEmits<ButtonEvents>,
  tooltip: UseFloatingReturn,
  popover: UseFloatingReturn,
) {
  const handleClick = () => {
    emit('click');
    popover?.toggle();
  };

  const handleEscape = ($event: KeyboardEvent) => {
    emit('escape', $event);
    popover?.close();
  };

  return {
    handleClick,
    handleEscape,
    tooltipHandlers: tooltip.handlers,
  };
}
