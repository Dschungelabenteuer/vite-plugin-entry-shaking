<script setup lang="ts">
import type * as Monaco from 'monaco-editor';
import type { CodeBlockProps, CodeBlockExposes } from './CodeBlock.types';
import { onMounted, ref, useTemplateRef, watch } from 'vue';
import { colorScheme } from '@composables/useColorScheme';
import { useClassNames } from '@composables/useClassNames';
import { applyMonacoTheme, createReadOnlyMonacoEditor } from './monaco';
import { getMonaco, getMonacoWordWrap, guessMonacoLanguage } from './monaco';

const props = defineProps<CodeBlockProps>();
const $class = useClassNames('code-block');
const elRef = useTemplateRef('elRef');

let monaco: typeof Monaco | null = null;
let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
let model: Monaco.editor.ITextModel | null = null;
let decorations: Monaco.editor.IEditorDecorationsCollection | null = null;
const editorReady = ref(false);

onMounted(async () => {
  if (!elRef.value) return;
  const wordWrap = getMonacoWordWrap(props.lineWrap);
  monaco = await getMonaco();
  editor = createReadOnlyMonacoEditor(monaco, elRef.value, { wordWrap });
  model = monaco.editor.createModel(props.content, props.language ?? 'javascript');
  decorations = editor.createDecorationsCollection();
  editor.setModel(model);
  applyMonacoTheme(monaco);
  editorReady.value = true;
});

function reset(value: string) {
  decorations?.set([]);
  setModelValue(value);
}

function setModelValue(value: string) {
  if (model && model.getValue() !== value) {
    model.setValue(value);
  }
}

function addDecorations(decorationsToAdd: Monaco.editor.IModelDeltaDecoration[]) {
  decorations?.set(decorationsToAdd);
}

function dispose() {
  model?.dispose();
  editor?.dispose();
}

function layout() {
  editor?.layout();
}

function getEditor() {
  return editor;
}

function getModel() {
  return model;
}

watch(
  () => props.lineWrap,
  (enabled) => {
    const wordWrap = getMonacoWordWrap(enabled);
    editor?.updateOptions({ wordWrap });
  },
  { immediate: true }
);

watch(colorScheme, () => {
  if (monaco) applyMonacoTheme(monaco);
});

defineExpose<CodeBlockExposes>({
  editorReady,
  decorations,
  getEditor,
  getModel,
  setModelValue,
  reset,
  addDecorations,
  layout,
  dispose,
});
</script>

<template>
  <div
    ref="elRef"
    :class="$class()"
  />
</template>

<style>
.code-block {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
}
</style>
