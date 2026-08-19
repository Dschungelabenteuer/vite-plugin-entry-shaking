export type CodeBlockDiffsProps = {
  /** Source code. */
  from: string;
  /** Target code when using diffs. */
  to: string;
  /** Display diffs in a single column? */
  mode: 'simple' | 'side-by-side';
  /** Wrap long lines?. */
  lineWrap: boolean;
};

export type CodeBlockDiffsSimpleProps = Omit<CodeBlockDiffsProps, 'mode'>;
export type CodeBlockDiffsSideBySideProps = Omit<CodeBlockDiffsProps, 'mode'>;
