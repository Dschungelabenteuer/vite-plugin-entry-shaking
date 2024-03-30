import type { ComponentPublicInstance } from 'vue';
import type { TooltipOptions } from '@components/Tooltip/Tooltip.types';
import type Button from './Button.vue';

export type ButtonProps = {
  /** Button label. */
  label: string;
  /** If specified, reason why the button is disabled. */
  disabled?: boolean | string;
  /** Button icon. */
  icon?: string;
  /** Should we only show the icon? */
  iconOnly?: boolean;
  /** Tooltip options. */
  tooltipOptions?: TooltipOptions;
};

export type ButtonEvents = {
  /** Emitted when clicking the button. */
  'click': [];
  /** Emitted when keydown is triggered. */
  'keydown': [event: KeyboardEvent];
  /** Emitted when pressing the Arrow Up key. */
  'arrow-up': [event: KeyboardEvent];
  /** Emitted when pressing the Arrow Down key. */
  'arrow-down': [event: KeyboardEvent];
  /** Emitted when pressing the Arrow Left key. */
  'arrow-left': [event: KeyboardEvent];
  /** Emitted when pressing the Arrow Right key. */
  'arrow-right': [event: KeyboardEvent];
  /** Emitted when pressing the Page Up key. */
  'page-up': [event: KeyboardEvent];
  /** Emitted when pressing the Page Down key. */
  'page-down': [event: KeyboardEvent];
  /** Emitted when pressing the Arrow Home key. */
  'key-home': [event: KeyboardEvent];
  /** Emitted when pressing the Arrow End key. */
  'key-end': [event: KeyboardEvent];
  /** Emitted when escaping. */
  'escape': [event: KeyboardEvent];
  /** Emitted when shift+tabbing. */
  'shift-tab': [event: KeyboardEvent];
  /** Emitted when tabbing. */
  'tab': [event: KeyboardEvent];
};

export type ButtonSlots = {
  /** Button popover content. */
  popover(props: { isOpen: boolean; isTransitioning: boolean }): any;
  /** Button trailing content. */
  after(): any;
};

export type ButtonInstance = InstanceType<typeof Button> & ComponentPublicInstance;
