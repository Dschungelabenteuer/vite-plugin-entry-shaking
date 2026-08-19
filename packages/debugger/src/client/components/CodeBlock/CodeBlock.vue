<script setup lang="ts">
import type * as Monaco from 'monaco-editor';
import type { CodeBlockProps } from './CodeBlock.types';
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui';
import { computed, nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue';
import { colorScheme } from '@composables/useColorScheme';
import {
  applyMonacoTheme,
  createReadOnlyMonacoEditor,
  getMonaco,
  getMonacoWordWrap,
  guessMonacoLanguage,
  setModelLanguageIfNeeded,
  setupMonacoScrollSync,
  syncMonacoEditorScrolls,
} from './monaco';
import { calculateDiffWithWorker } from '@workers/diffs/diff';
import Dialog from '@components/Dialog/Dialog.vue';
import Button from '@components/Button/Button.vue';

const props = defineProps<CodeBlockProps>();

const diffPanelSize = defineModel<number>('diffPanelSize', { required: true });
const dialogRef = useTemplateRef<InstanceType<typeof Dialog>>('dialogRef');

const fromEl = useTemplateRef('fromEl');
const toEl = useTemplateRef('toEl');

let monaco: typeof Monaco | null = null;
let fromEditor: Monaco.editor.IStandaloneCodeEditor | null = null;
let toEditor: Monaco.editor.IStandaloneCodeEditor | null = null;
let fromModel: Monaco.editor.ITextModel | null = null;
let toModel: Monaco.editor.ITextModel | null = null;
let fromDecorations: Monaco.editor.IEditorDecorationsCollection | null = null;
let toDecorations: Monaco.editor.IEditorDecorationsCollection | null = null;
let disposeScrollSync: (() => void) | null = null;
let diffVersion = 0;

function setModelValue(model: Monaco.editor.ITextModel, value: string) {
  if (model.getValue() !== value) model.setValue(value);
}

function applyDiffDecorations(changes: Array<[number, string]>) {
  if (!monaco || !fromModel || !toModel || !fromDecorations || !toDecorations) return;

  const fromEntries: Monaco.editor.IModelDeltaDecoration[] = [];
  const toEntries: Monaco.editor.IModelDeltaDecoration[] = [];

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
          range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
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
          range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
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
      range: new monaco.Range(line, 1, line, 1),
      options: { className: 'diff-removed', isWholeLine: true },
    });
  }

  for (const line of addedLines) {
    toEntries.push({
      range: new monaco.Range(line, 1, line, 1),
      options: { className: 'diff-added', isWholeLine: true },
    });
  }

  fromDecorations.set(fromEntries);
  toDecorations.set(toEntries);
}

onMounted(async () => {
  if (!fromEl.value || !toEl.value) return;

  monaco = await getMonaco();

  fromEditor = createReadOnlyMonacoEditor(monaco, fromEl.value, {
    wordWrap: getMonacoWordWrap(props.lineWrap),
  });
  toEditor = createReadOnlyMonacoEditor(monaco, toEl.value, {
    wordWrap: getMonacoWordWrap(props.lineWrap),
  });

  fromModel = monaco.editor.createModel(props.from, guessMonacoLanguage(props.from));
  toModel = monaco.editor.createModel(props.to, guessMonacoLanguage(props.to));

  fromEditor.setModel(fromModel);
  toEditor.setModel(toModel);

  fromDecorations = fromEditor.createDecorationsCollection();
  toDecorations = toEditor.createDecorationsCollection();

  disposeScrollSync = setupMonacoScrollSync(fromEditor, toEditor);

  applyMonacoTheme(monaco);

  if (!props.oneColumn) syncMonacoEditorScrolls(toEditor, fromEditor);

  await updateDiffDecorations(props.from, props.to, props.diff);
});

watch(
  () => props.lineWrap,
  (enabled) => {
    const wordWrap = getMonacoWordWrap(enabled);
    fromEditor?.updateOptions({ wordWrap });
    toEditor?.updateOptions({ wordWrap });
  },
  { immediate: true }
);

watch(colorScheme, () => {
  if (monaco) applyMonacoTheme(monaco);
});

watch(
  () => props.oneColumn,
  async (oneColumn) => {
    if (!fromEditor || !toEditor) return;

    fromEl.value!.style.display = oneColumn ? 'none' : '';

    await nextTick();

    fromEditor.layout();
    toEditor.layout();

    if (!oneColumn) syncMonacoEditorScrolls(toEditor, fromEditor);
  },
  { immediate: true }
);

async function updateDiffDecorations(from: string, to: string, diffEnabled: boolean) {
  if (!monaco || !fromModel || !toModel || !fromDecorations || !toDecorations) return;

  const currentVersion = ++diffVersion;

  setModelValue(fromModel, from);
  setModelValue(toModel, to);

  setModelLanguageIfNeeded(monaco, fromModel, guessMonacoLanguage(from));
  setModelLanguageIfNeeded(monaco, toModel, guessMonacoLanguage(to));

  fromDecorations.set([]);
  toDecorations.set([]);

  if (!diffEnabled || !from || from === to) return;

  const changes = await calculateDiffWithWorker(from, to);
  if (currentVersion !== diffVersion) return;

  applyDiffDecorations(changes);
}

watch(
  () => [props.from, props.to, props.diff] as const,
  ([from, to, diffEnabled]) => {
    updateDiffDecorations(from, to, diffEnabled);
  }
);

const leftPanelSize = computed(() => {
  return props.oneColumn ? 0 : diffPanelSize.value;
});

function onUpdate() {
  fromEditor?.layout();
  toEditor?.layout();
}

onBeforeUnmount(() => {
  disposeScrollSync?.();
  fromEditor?.dispose();
  toEditor?.dispose();
  fromModel?.dispose();
  toModel?.dispose();
});

const openSideBySide = (path: string) => {
  dialogRef.value?.element?.showModal();
};
</script>

<template>
  <Button
    v-if="props.from && props.to && props.diff"
    label="ohohoh"
    @click="openSideBySide('some/path')"
  />
  <SplitterGroup
    direction="horizontal"
    style="height: 100%; width: 100%"
  >
    <SplitterPanel
      v-show="!oneColumn"
      class="code-panel"
    >
      <div
        ref="fromEl"
        class="code-block"
      />
    </SplitterPanel>
    <SplitterResizeHandle
      v-show="!oneColumn"
      class="code-panel-resize-handler"
    />
    <SplitterPanel class="code-panel">
      <div
        ref="toEl"
        class="code-block"
      />
    </SplitterPanel>
  </SplitterGroup>
  <Dialog
    ref="dialogRef"
    title="Transform diff side-by-side"
    width="960px"
    height="640px"
  >
    coucou

    <template #footer>
      <Button
        label="Close"
        icon="x"
        shortcut="ESC"
        :bordered="true"
        :class="['bordered', 'small']"
        @click="dialogRef?.element?.close()"
      />
    </template>
  </Dialog>
</template>

<style>
.diff-added {
  background: rgba(16, 185, 129, 0.15);
}
.diff-removed {
  background: rgba(239, 68, 68, 0.15);
}
.diff-added-inline {
  background-color: rgba(16, 185, 129, 0.3);
}
.diff-removed-inline {
  background-color: rgba(239, 68, 68, 0.3);
}
</style>

<style scoped>
.code-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-panel-resize-handler[data-orientation='horizontal'] {
  width: 0.5rem;
}

.code-panel-resize-handler[data-orientation='vertical'] {
  height: 0.5rem;
}

.code-block {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
}
</style>
