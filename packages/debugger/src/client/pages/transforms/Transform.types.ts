import type { TransformData } from 'vite-plugin-entry-shaking';
import type { Paths } from '#types';
import type { GridRowProps } from '@views/Grid/Grid.types';

export type TransformProps = GridRowProps<TransformData & Paths>;

export type TransformEvents = {
  /** Emitted when the user clicks on the "view" button. */
  view: [path: string];
};

export type TransformDetailsProps = {
  /** Transform data. */
  transform?: TransformData;
} & Paths;

export type TransformDetailsEvents = {
  /** Emitted when the end of the tab list is reached. */
  'end-reached': [];
};
