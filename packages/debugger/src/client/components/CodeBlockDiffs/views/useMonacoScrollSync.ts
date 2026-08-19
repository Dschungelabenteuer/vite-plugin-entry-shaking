import type CodeBlock from '@components/CodeBlock/CodeBlock.vue';
import type { monaco } from '@workers/editor/editor';
import { watch, onBeforeUnmount } from 'vue';
import type { ShallowRef } from 'vue';

export function useMonacoScrollSync(
  fromRef: Readonly<ShallowRef<InstanceType<typeof CodeBlock> | null>>,
  toRef: Readonly<ShallowRef<InstanceType<typeof CodeBlock> | null>>
) {
  let disposeScrollSync = () => {};
  const setup = () => {
    const fromEditor = fromRef.value?.getEditor();
    const toEditor = toRef.value?.getEditor();
    if (fromEditor && toEditor) {
      disposeScrollSync = setupMonacoScrollSync(fromEditor, toEditor);
    }
  };

  watch(() => [fromRef.value?.editorReady, toRef.value?.editorReady], setup, { immediate: true });

  onBeforeUnmount(() => {
    disposeScrollSync();
  });

  return { syncMonacoEditorScrolls };
}

function mapScroll(primaryPos: number, primaryMax: number, targetMax: number) {
  if (primaryMax <= 0 || targetMax <= 0) return 0;
  return (targetMax / primaryMax) * primaryPos;
}

function syncMonacoEditorScrolls(
  primary: monaco.editor.IStandaloneCodeEditor,
  target: monaco.editor.IStandaloneCodeEditor
) {
  const pMaxX = Math.max(primary.getScrollWidth() - primary.getLayoutInfo().width, 0);
  const pMaxY = Math.max(primary.getScrollHeight() - primary.getLayoutInfo().height, 0);
  const tMaxX = Math.max(target.getScrollWidth() - target.getLayoutInfo().width, 0);
  const tMaxY = Math.max(target.getScrollHeight() - target.getLayoutInfo().height, 0);

  const scrollLeft = mapScroll(primary.getScrollLeft(), pMaxX, tMaxX);
  const scrollTop = mapScroll(primary.getScrollTop(), pMaxY, tMaxY);

  target.setScrollPosition({
    scrollLeft: Number.isFinite(scrollLeft) ? scrollLeft : 0,
    scrollTop: Number.isFinite(scrollTop) ? scrollTop : 0,
  });
}

function setupMonacoScrollSync(
  le: monaco.editor.IStandaloneCodeEditor,
  re: monaco.editor.IStandaloneCodeEditor
) {
  let activeEditor = 1;

  const lenode = le.getDomNode();
  const renode = re.getDomNode();

  const enterLe = () => (activeEditor = 1);
  const enterRe = () => (activeEditor = 2);

  lenode?.addEventListener('mouseenter', enterLe);
  renode?.addEventListener('mouseenter', enterRe);

  const disposables: monaco.IDisposable[] = [
    le.onDidScrollChange(() => activeEditor === 1 && syncMonacoEditorScrolls(le, re)),
    re.onDidScrollChange(() => activeEditor === 2 && syncMonacoEditorScrolls(re, le)),
    le.onDidChangeCursorPosition(() => syncMonacoEditorScrolls(le, re)),
    re.onDidChangeCursorPosition(() => syncMonacoEditorScrolls(re, le)),
  ];

  return () => {
    lenode?.removeEventListener('mouseenter', enterLe);
    renode?.removeEventListener('mouseenter', enterRe);
    disposables.forEach((d) => d.dispose());
  };
}
