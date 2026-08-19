import type * as Monaco from 'monaco-editor';
import { colorScheme } from '@composables/useColorScheme';
import { monaco } from '@workers/editor/editor';
import { light, dark } from './monaco-themes';

monaco.editor.defineTheme(light.name, light.data);
monaco.editor.defineTheme(dark.name, dark.data);
const getThemeId = () => (colorScheme.value === 'dark' ? dark.name : light.name);

export const getMonaco = () => monaco;
export const applyMonacoTheme = (monaco: typeof Monaco) => monaco.editor.setTheme(getThemeId());

export function getMonacoWordWrap(
  enabled: boolean
): Monaco.editor.IStandaloneEditorConstructionOptions['wordWrap'] {
  return enabled ? 'on' : 'off';
}

const readonlyEditorOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  fontFamily: "'Input Mono', 'FiraCode', monospace",
  fontSize: 13,
  lineNumbers: 'on',
  minimap: { enabled: false },
  readOnly: true,
  renderLineHighlight: 'none',
  scrollBeyondLastLine: false,
  scrollbar: {
    alwaysConsumeMouseWheel: false,
    horizontal: 'auto',
    horizontalScrollbarSize: 6,
    useShadows: false,
    vertical: 'auto',
    verticalScrollbarSize: 6,
  },
};

export function createReadOnlyMonacoEditor(
  monaco: typeof Monaco,
  container: HTMLElement,
  options: Monaco.editor.IStandaloneEditorConstructionOptions = {}
) {
  const scrollbar = { ...readonlyEditorOptions.scrollbar, ...options.scrollbar };
  return monaco.editor.create(container, { ...readonlyEditorOptions, ...options, scrollbar });
}

export function setModelLanguageIfNeeded(
  monaco: typeof Monaco,
  model: Monaco.editor.ITextModel,
  language: string
) {
  if (model.getLanguageId() !== language) monaco.editor.setModelLanguage(model, language);
}

export function guessMonacoLanguage(code: string) {
  if (code.trimStart().startsWith('<')) return 'html';
  if (/^import\s/.test(code)) return 'javascript';
  if (/^[.#].+\{/.test(code)) return 'css';
  return 'javascript';
}

function mapScroll(primaryPos: number, primaryMax: number, targetMax: number) {
  if (primaryMax <= 0 || targetMax <= 0) return 0;
  return (targetMax / primaryMax) * primaryPos;
}

export function syncMonacoEditorScrolls(
  primary: Monaco.editor.IStandaloneCodeEditor,
  target: Monaco.editor.IStandaloneCodeEditor
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

export function setupMonacoScrollSync(
  le: Monaco.editor.IStandaloneCodeEditor,
  re: Monaco.editor.IStandaloneCodeEditor
) {
  let activeEditor = 1;

  const lenode = le.getDomNode();
  const renode = re.getDomNode();

  const enterLe = () => (activeEditor = 1);
  const enterRe = () => (activeEditor = 2);

  lenode?.addEventListener('mouseenter', enterLe);
  renode?.addEventListener('mouseenter', enterRe);

  const disposables: Monaco.IDisposable[] = [
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
