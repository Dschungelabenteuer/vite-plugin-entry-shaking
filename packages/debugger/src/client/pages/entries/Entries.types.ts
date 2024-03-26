import type { EntryData } from 'vite-plugin-entry-shaking';
import type { ImportParams } from 'vite-plugin-entry-shaking/src/types';
import type { GridRowProps } from '@views/Grid/Grid.types';

export type EntryDetailsProps = {
  /** Entry path. */
  path?: string;
  /** Entry data. */
  entry?: EntryData;
};

export type EntryDetailsEvents = {
  /** Emitted when the end of the tab list is reached. */
  'end-reached': [];
};

export type EntryProps = GridRowProps<
  EntryData & {
    /** Entry file path. */
    path: string;
  }
>;

export type EntryEvents = {
  /** Emitted when the user clicks on the "view" button. */
  view: [path: string];
};

export type TransformProps = GridRowProps<ImportParams & { name: string }>;

export type WildcardProps = GridRowProps<{
  /** Name of the wilcard-imported entity. */
  name: string;
  /** Source path of the entity. */
  path: string;
}>;
