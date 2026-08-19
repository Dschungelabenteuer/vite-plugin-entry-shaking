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
