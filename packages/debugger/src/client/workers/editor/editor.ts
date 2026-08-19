import * as monaco from 'monaco-editor';

import 'monaco-editor/language/typescript/monaco.contribution.js';
// oxlint-disable-next-line import/default
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
// oxlint-disable-next-line import/default
import TsWorker from 'monaco-editor/language/typescript/ts.worker?worker';

declare global {
  interface Window {
    MonacoEnvironment?: { getWorker(moduleId: string, label: string): Worker };
  }
}

self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'javascript' || label === 'typescript') return new TsWorker();
    return new EditorWorker();
  },
};

export { monaco };
