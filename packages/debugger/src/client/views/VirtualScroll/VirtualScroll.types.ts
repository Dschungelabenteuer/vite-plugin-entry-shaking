export interface VirtualScrollProps {
  /** Items of the virtual scroll. */
  items: any[];
  /** Size (px) of the virtual scroll container. */
  itemSize: number;
  /** Number of items to prerender before the first visible item. */
  prerenderedBeforeStart?: number;
  /** Number of items to prerender after the last visible item. */
  prerenderAfterEnd?: number;
  /** Optional delay before setting wrapper's overflow to auto (useful for transitions). */
  overflowDelay?: number;
  /** Padding of the visible nodes. */
  padding?: number;
  /** Virtual scroll axis */
  axis?: 'x' | 'y';
}

export type VirtualScrollEvents = {
  /** Emitted when virutal scroll container is resized. */
  resize: [{ width: number; height: number }];
  /** Emitted when the list is being scrolled. */
  scroll: [];
  /** Emitted when all visible items are rendered (after transition). */
  rendered: [];
};

export type VirtualScrollSlots = {
  /** Content of a single item. */
  default(prop: { item: any }): any;
  /** Content shown before the scroll container. */
  before(): any;
  /** Content shown after the scroll container. */
  after(): any;
};
