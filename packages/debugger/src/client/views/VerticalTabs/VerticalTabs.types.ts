import type { Component, DefineComponent } from 'vue';

export type VerticalTab = {
  /** Tab ID. */
  id: string;
  /** Tab label. */
  label: string;
  /** Tab icon. */
  icon: string;
  /** Tab item count. */
  count?: number;
  /** Tab content component. */
  component: Component | DefineComponent;
};

export type VerticalTabsProps = {
  /** Tablist ID. */
  id: string;
  /** Tablist label. */
  label: string;
  /** Tablist width. */
  width: string;
  /** List of tabs. */
  tabs: VerticalTab[];
  /** Should we only show the icon of tab buttons? */
  iconOnly?: boolean;
  /** ID of the default active tab. */
  activeTabId?: string;
};
