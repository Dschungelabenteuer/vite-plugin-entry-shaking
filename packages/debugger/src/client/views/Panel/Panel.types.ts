import type { Ref } from 'vue';

export type PanelProps = {
  /** Panel ID. */
  panelId: string;
  /** Panel title. */
  title: string;
  /** Close panel label. */
  closePanelLabel: string;
};

export type PanelSlots = {
  /** Panel content. */
  default(): any;
  /** Panel footer. */
  footer(): any;
};

export type Panel = {
  /** ID for the close button element. */
  closeBtnId: string;
  /** ID for the open button element. */
  openBtnId: string;
  /** Is the panel expanded? */
  isOpen: Ref<boolean>;
  /** Toggles the panel on and off. */
  toggle: () => void;
};

export type PanelHeaderProps = Pick<Panel, 'toggle'> &
  Pick<PanelProps, 'closePanelLabel' | 'panelId'> & {
    /** Is the panel expanded? */
    isOpen: boolean;
  };
