import type { Diagnostic, DiagnosticsConfig, FinalPluginOptions } from './types';

/** Plugin's diagnostics. */
export class Diagnostics {
  /** List of all emitted diagnostics */
  public list: Diagnostic[] = [];

  /** Map of all emitted diagnostics indices indexed by file path. */
  public listPerPath = new Map<string, number[]>();

  constructor(public options: Required<FinalPluginOptions>) {}

  /**
   * Emits a diagnostic.
   * @param name Diagnostic name.
   * @param message Diagnostic message.
   * @param data Diagnostic context data.
   */
  add(name: keyof DiagnosticsConfig, message: string, data?: any): number {
    this.list.push({ name, message, data });
    const diagnosticIndex = this.list.length - 1;

    if (data.source) {
      if (!this.listPerPath.has(data.source)) {
        this.listPerPath.set(data.source, [diagnosticIndex]);
      } else {
        this.listPerPath.get(data.source)?.push(diagnosticIndex);
      }
    }

    return diagnosticIndex;
  }

  /**
   * Determines whether a specific diagnostic is enabled.
   * @param name Diagnostic name.
   */
  isEnabled(name: keyof DiagnosticsConfig) {
    return this.options.diagnostics[name] === true;
  }
}

export const DiagnosticKinds = {
  definedWithinEntry: (entryPath: string) => {
    const name: keyof DiagnosticsConfig = 'definedWithinEntry';
    const base = `Entry file "${entryPath}" exports code it defines and imports code from other modules.`;
    const message =
      `${base} Such imports are never cleaned up because they could have side-effects and be consumed by` +
      ` code defined by the entry file. Determining whether such imports are unused could be expensive.` +
      ` This means that if you were to import any entity defined by that entry file, it could result in unnecessary requests.` +
      `\n` +
      `You may ignore this warning by setting the \`diagnostics.definedWithinEntry\` option to false.`;
    return { base, name, message };
  },

  maxDepthReached: (path: string, importedFrom: string) => {
    const name: keyof DiagnosticsConfig = 'maxDepthReached';
    const base = `Max depth reached at path "${importedFrom}", skipping wildcard import analysis of "${path}"…`;
    const message =
      `${base} Such imports are never cleaned up because they could have side-effects and be consumed by` +
      ` code defined by the entry file. Determining whether such imports are unused could be expensive.` +
      ` This means that if you were to import any entity defined by that entry file, it could result in unnecessary requests.` +
      `\n` +
      `You may ignore this warning by setting the \`diagnostics.definedWithinEntry\` option to false.`;
    return { base, name, message };
  },
};
