import type { VerticalTab } from '@views/VerticalTabs/VerticalTabs.types';

export type DetailsProps = {
  /** Details ID */
  id: string;
  /** Absolute path to file. */
  absolutePath: string;
  /** Relative path to file. */
  relativePath: string;

  /** Tab list. */
  tabs: VerticalTab[];
  /** Details tabs label. */
  tabsLabel: string;
  /** Details tabs width. */
  tabsWidth: string;
  /** Details tabs' min content width */
  tabsMinContentWidth: string;
  /** ID of the default active tab. */
  activeTabId?: string;
};
