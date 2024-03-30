import type { Log } from 'vite-plugin-entry-shaking';
import type { GridRowProps } from '@views/Grid/Grid.types';

export type LogProps = GridRowProps<{
  /** Log message content. */
  content: Log['content'];
  /** Log level. */
  level: Log['level'];
  /** Log time. */
  timestamp?: Log['timestamp'];
}>;
