export type BrowserProps = {
  /** Browser page name. */
  name: string;
  /** Page icon. */
  pageIcon?: string | undefined;
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
  /** Condensed display? (reduces overall spacing). @todo style-only */
  condensed?: boolean;
};

export type BrowserEvents = {
  /** Emitted when the search input changes. */
  search: [q: string];
};

export type BrowserSlots = {
  /** Browser content. */
  default(): any;
  /** Browser filters. */
  filters(): any;
};

export type BrowserSearchFn = (e: InputEvent) => void;
