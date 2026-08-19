import type { ShallowRef } from 'vue';
import type CodeBlock from '@components/CodeBlock/CodeBlock.vue';
import type { Diff } from 'diff-match-patch-es';
import { onBeforeUnmount, ref, watch } from 'vue';
import { monaco } from '@workers/editor/editor';
import { Range } from 'monaco-editor';
import { calculateDiffWithWorker } from '@workers/diffs/diff';

export function useMonacoDiffs(
  toRef: ShallowRef<InstanceType<typeof CodeBlock> | null>,
  fromRef: ShallowRef<InstanceType<typeof CodeBlock> | null>
) {
  const editorsReady = ref(false);
  const pendingDiffs = ref<Diff[]>([]);
  let diffVersion = 0;

  function applyDiffDecorations(changes: Array<[number, string]>) {
    const fromModel = fromRef.value?.getModel();
    const toModel = toRef.value?.getModel();
    if (!monaco || !fromModel || !toModel) return;

    const fromEntries: monaco.editor.IModelDeltaDecoration[] = [];
    const toEntries: monaco.editor.IModelDeltaDecoration[] = [];

    const addedLines = new Set<number>();
    const removedLines = new Set<number>();

    let fromIndex = 0;
    let toIndex = 0;

    for (const [type, change] of changes) {
      if (type === 1) {
        const start = toModel.getPositionAt(toIndex);
        toIndex += change.length;
        const end = toModel.getPositionAt(toIndex);

        if (start.lineNumber !== end.lineNumber || start.column !== end.column) {
          toEntries.push({
            range: new Range(start.lineNumber, start.column, end.lineNumber, end.column),
            options: { inlineClassName: 'diff-added-inline' },
          });
        }

        for (let i = start.lineNumber; i <= end.lineNumber; i++) addedLines.add(i);
      } else if (type === -1) {
        const start = fromModel.getPositionAt(fromIndex);
        fromIndex += change.length;
        const end = fromModel.getPositionAt(fromIndex);

        if (start.lineNumber !== end.lineNumber || start.column !== end.column) {
          fromEntries.push({
            range: new Range(start.lineNumber, start.column, end.lineNumber, end.column),
            options: { inlineClassName: 'diff-removed-inline' },
          });
        }

        for (let i = start.lineNumber; i <= end.lineNumber; i++) removedLines.add(i);
      } else {
        fromIndex += change.length;
        toIndex += change.length;
      }
    }

    for (const line of removedLines) {
      fromEntries.push({
        range: new Range(line, 1, line, 1),
        options: { className: 'diff-removed', isWholeLine: true },
      });
    }

    for (const line of addedLines) {
      toEntries.push({
        range: new Range(line, 1, line, 1),
        options: { className: 'diff-added', isWholeLine: true },
      });
    }

    fromRef.value?.addDecorations(fromEntries);
    toRef.value?.addDecorations(toEntries);
  }

  onBeforeUnmount(() => {
    fromRef.value?.dispose();
    toRef.value?.dispose();
  });

  watch(
    () => [fromRef.value?.editorReady, toRef.value?.editorReady],
    ([fromReady, toReady]) => {
      if (fromReady && toReady) {
        editorsReady.value = true;
        if (pendingDiffs.value.length > 0) {
          applyDiffDecorations(pendingDiffs.value);
          pendingDiffs.value = [];
        }
      }
    },
    { immediate: true }
  );

  function handleChange(from: string, to: string) {
    if (from === to) return;
    const currentVersion = ++diffVersion;

    calculateDiffWithWorker(from, to).then((changes) => {
      if (currentVersion !== diffVersion) return;
      if (editorsReady.value) {
        pendingDiffs.value = [];
        applyDiffDecorations(changes);
      } else {
        pendingDiffs.value = changes;
      }
    });

    onBeforeUnmount(() => {
      fromRef.value?.dispose();
      toRef.value?.dispose();
    });
  }

  return { handleChange };
}
