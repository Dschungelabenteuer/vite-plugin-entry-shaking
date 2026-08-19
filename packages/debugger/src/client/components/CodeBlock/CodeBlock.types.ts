import type * as Monaco from 'monaco-editor';
import type { Ref } from 'vue';

export type CodeBlockProps = {
  /** Source code. */
  content: string;
  /** Code language. */
  language?: string;
  /** Wrap long lines?. */
  lineWrap?: boolean;
};

export type CodeBlockExposes = {
  editorReady: Ref<boolean>;
  decorations: Monaco.editor.IEditorDecorationsCollection | null;
  getEditor(): Monaco.editor.IStandaloneCodeEditor | null;
  getModel(): Monaco.editor.ITextModel | null;
  setModelValue(value: string): void;
  reset(value: string): void;
  addDecorations(decorationsToAdd: Monaco.editor.IModelDeltaDecoration[]): void;
  layout(): void;
  dispose(): void;
};
