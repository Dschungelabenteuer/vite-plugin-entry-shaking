export type CodeBlockProps = {
  /** Source code. */
  from: string;
  /** Target code when using diffs. */
  to: string;
  /** Display diffs in a single column? */
  oneColumn: boolean;
  /** Enable diff feature? */
  diff: boolean;
  /** Wrap long lines?. */
  lineWrap: boolean;
};
