import type { ShikiTransformer, ThemeRegistrationAny } from 'shiki';

export type CodeBlockProps = {
  /** Source code. */
  source: string;
  /** Target code when using diffs. */
  target?: string;
  /** Code language. */
  lang?: string;
  /** Shiki theme. */
  theme?: ThemeRegistrationAny | string;
  /** Shiki transformers. */
  transformers?: ShikiTransformer[];
};
