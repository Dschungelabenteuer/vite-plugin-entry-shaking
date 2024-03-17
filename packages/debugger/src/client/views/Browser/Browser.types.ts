export type BrowserViewProps = {
  /** Browser page name. */
  name: string;
  /** Page icon. */
  pageIcon?: string;
  /** Label used for the "filter" button. */
  filterLabel?: string;
  /** Label used for the "search" input. */
  searchLabel?: string;
  /** Placeholder used for the "search" input. */
  searchPlaceholder?: string;
  /** Total count of items. */
  total?: number;
  /** Count of matched items. */
  matched?: number;
  /** Condensed display? (reduces overall spacing). */
  condensed?: boolean;
};

export type BrowserViewEvents = {
  /** Emitted when the search input changes. */
  search: [q: string];
};
