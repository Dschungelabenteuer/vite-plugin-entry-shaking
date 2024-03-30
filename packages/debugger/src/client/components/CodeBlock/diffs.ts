import { diff_match_patch as Diff } from 'diff-match-patch';

/** Diffs request payload sent to Worker. */
export interface DiffsRequestPayload {
  /** Absolute path to the file. */
  id: string;
  /** Original source content. */
  from: string;
  /** Updated source content. */
  to: string;
}

/** Diffs response payload received from Worker. */
export interface DiffsResponsePayload {
  /** Absolute path to the file. */
  id: string;
  /** All diffs content (source code with diff lines). */
  result: string;
}

type DiffAction = -1 | 0 | 1;
type DiffDefinition = [DiffAction, string];

const equalsOrDeletes = [Diff.DIFF_DELETE, Diff.DIFF_EQUAL] as [DiffAction, DiffAction];
const equalsOrInserts = [Diff.DIFF_INSERT, Diff.DIFF_EQUAL] as [DiffAction, DiffAction];

self.onmessage = (message: MessageEvent) => {
  const { id, from, to } = message.data as DiffsRequestPayload;
  const diffs = getDiffs(from, to) as DiffDefinition[];
  const result = concatDiffs(diffs);
  const output: DiffsResponsePayload = { id, result };
  self.postMessage(output);
};

function getDiffs(from: string, to: string) {
  const diff = new Diff();
  const result = diff.diff_main(from, to);
  diff.diff_cleanupSemantic(result);
  return result;
}

/**
 * I'm way too stupid so this is disgusting and absolutely not robust at all.
 * Sorry, but please feel free to contribute and do it the propery way :)
 */
function concatDiffs(diffs: DiffDefinition[]) {
  const allLines: string[] = [];
  let incrementalAddition: string | undefined;
  let incrementalRemoval: string | undefined;

  const addLine = (op: number, line: string) => {
    switch (op) {
      case Diff.DIFF_INSERT:
        allLines.push(`${line} // [!code ++]`);
        break;
      case Diff.DIFF_DELETE:
        allLines.push(`${line} // [!code --]`);
        break;
      default:
        allLines.push(line);
    }
  };

  diffs.forEach((diff) => {
    const [op, text] = diff;
    if (text === '\n') {
      if (incrementalRemoval) addLine(Diff.DIFF_DELETE, incrementalRemoval);
      if (incrementalAddition) addLine(Diff.DIFF_INSERT, incrementalAddition);
      return addLine(op, '');
    }
    const lines = text.split('\n');
    const lastLineIndex = lines.length - 1;

    if (lines.length === 1) {
      if (!incrementalAddition && !incrementalRemoval) {
        const [line] = lines;
        incrementalAddition = line;
        incrementalRemoval = line;
      }

      if (incrementalRemoval && op === Diff.DIFF_DELETE) incrementalRemoval += lines[0];
      if (incrementalAddition && op === Diff.DIFF_INSERT) incrementalAddition += lines[0];
      return;
    }

    lines.forEach((line, index) => {
      // First item.
      if (index === 0) {
        // If there isn't any incremental addition or removal, add the line.
        if (!incrementalAddition && !incrementalRemoval) {
          addLine(op, line);
        }
        // If there is an incremental removal, add the line and clear.
        if (incrementalRemoval && equalsOrDeletes.includes(op)) {
          addLine(Diff.DIFF_DELETE, incrementalRemoval + line);
          incrementalRemoval = undefined;
        }
        // If there is an incremental addition, add the line and clear.
        if (incrementalAddition && equalsOrInserts.includes(op)) {
          addLine(Diff.DIFF_INSERT, incrementalAddition + line);
          incrementalAddition = undefined;
        }
        return;
      }

      // If last item and unterminated line.
      if (index === lastLineIndex) {
        const isEOL = !line.trim().length;

        // If there isn't any incremental addition or removal and is EOL, add the line.
        if (!incrementalAddition && !incrementalRemoval && isEOL) {
          return;
        }

        if (isEOL) {
          // If there is an incremental removal and is EOLadd the line and clear.
          if (incrementalRemoval && equalsOrDeletes.includes(op)) {
            addLine(op, incrementalRemoval + line);
            incrementalRemoval = undefined;
          }
          // If there is an incremental addition and is EOL add the line and clear.
          if (incrementalAddition && equalsOrInserts.includes(op)) {
            addLine(op, incrementalAddition + line);
            incrementalAddition = undefined;
          }

          return;
        }

        switch (op) {
          case Diff.DIFF_INSERT:
            incrementalAddition = (incrementalAddition ?? '') + line;
            break;
          case Diff.DIFF_DELETE:
            incrementalRemoval = (incrementalRemoval ?? '') + line;
            break;
          default:
            incrementalRemoval = (incrementalRemoval ?? '') + line;
            incrementalAddition = (incrementalAddition ?? '') + line;
            break;
        }
      }

      if (!incrementalAddition && !incrementalRemoval) {
        addLine(Diff.DIFF_EQUAL, line);
        return;
      }
      if (!incrementalAddition && op === Diff.DIFF_INSERT) {
        addLine(Diff.DIFF_INSERT, line);
      }

      if (!incrementalRemoval && op === Diff.DIFF_DELETE) {
        addLine(Diff.DIFF_DELETE, line);
      }
    });
  });

  const output = allLines.join('\n');

  return output;
}
