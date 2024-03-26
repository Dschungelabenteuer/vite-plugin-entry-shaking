import type { DiffsRequestPayload, DiffsResponsePayload } from './diffs';

let worker: Worker;
const queue = new Map();

/** Composable used to compute and get diffs between two strings. */
export function useDiffs() {
  /** Loads a Web Worker dedicated to compute diffs off the main thread. */
  const prepare = async () => {
    if (!worker) {
      const { default: DiffsWorker } = await import('./diffs?worker');
      worker = new DiffsWorker();
      worker.onmessage = handleDiffsResponse;
    }
  };

  /**
   * Asks the dedicated Web Worker to compare two strings.
   * @param id ID of the file we want to compute diffs from.
   * @param from Source content of the file.
   * @param to Updated content of the file.
   */
  const compare = async (id: string, from: string, to: string) => {
    const input: DiffsRequestPayload = { id, from, to };
    worker?.postMessage(input);
    const output: DiffsResponsePayload['result'] = await new Promise((resolve) =>
      queue.set(id, resolve),
    );
    return output;
  };

  return { prepare, compare };
}

/**
 * Handles the response of the dedicated Web Worker, once it finished comparing two strings.
 * @param e Message event received from the Web Worker.
 */
function handleDiffsResponse(e: MessageEvent<{ id: string; result: string }>) {
  const { id, result } = e.data;
  const resolve = queue.get(id);
  resolve?.(result);
  queue.delete(id);
}
