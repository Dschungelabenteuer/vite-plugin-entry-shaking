import type { TooltipOptions } from '@components/Tooltip/Tooltip.types';

export type IconProps = {
  /** Icon name. */
  name: string;
  /** Tooltip attached to the icon. */
  tooltip?: string;
  /** Tooltip options. */
  tooltipOptions?: TooltipOptions;
};
