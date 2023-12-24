import type { DiffsFileId, DiffsRequestPayload, DiffsResponsePayload } from '../../types';

let worker: Worker;

const queue = new Map();

export function useDiffs() {
  const prepare = async () => {
    if (!worker) {
      const { default: DiffsWorker } = await import('../workers/diffs?worker');
      worker = new DiffsWorker();
      worker.onmessage = handleDiffsResponse;
    }
  };

  const compare = async (id: DiffsFileId, from: string, to: string) => {
    const input: DiffsRequestPayload = { id, from, to };
    worker?.postMessage(input);
    const output: DiffsResponsePayload['result'] = await new Promise((resolve) =>
      queue.set(id, resolve),
    );
    return output;
  };

  return { prepare, compare };
}

function handleDiffsResponse(e: MessageEvent) {
  const { id, result } = e.data;
  const resolve = queue.get(id);
  resolve?.(result);
  queue.delete(id);
}
