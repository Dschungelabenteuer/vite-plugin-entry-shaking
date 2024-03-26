import type { Placement } from '@floating-ui/vue';

export type TooltipProps = {
  isOpen: boolean;
};

export type TooltipSlots = {
  /** Tooltip content. */
  default(): any;
};

export type TooltipOptions = {
  /** Prefered placement of the tooltip. */
  placement?: Placement;
  /** Should we disable tooltip position's autoupdate? */
  autoupdatePosition?: boolean;
  /** Should we disable auto-tooltip when using `iconOnly`? */
  disabled?: boolean;
};
