import type { DiagnosticsConfig, FinalPluginOptions } from './types';

export interface Diagnostic {
  /** Diagnostic source file. */
  file?: string;
  /** Diagnostic name. */
  name: keyof DiagnosticsConfig;
  /** Diagnostic message. */
  message: string;
  /** Diagnostic context data. */
  data?: any;
}

/** Plugin's diagnostics. */
export class Diagnostics {
  /** List of all emitted diagnostics */
  public list: Diagnostic[] = [];

  /** Map of all emitted diagnostics indices indexed by file path. */
  public listPerPath: Map<string, number[]> = new Map();

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

    if (data.path) {
      if (!this.listPerPath.has(data.path)) {
        this.listPerPath.set(data.path, []);
      } else {
        this.listPerPath.get(data.path)?.push(diagnosticIndex);
      }
    }

    return diagnosticIndex;
  }

  /**
   * Determines whether a specific diagnostic is enabled.
   * @param name Diagnostic name.
   */
  isEnabled(name: keyof DiagnosticsConfig) {
    return this.options.diagnostics?.[name] === true;
  }
}

export const DiagnosticKinds = {
  definedWithinEntry: (entryPath: string) => {
    const name: keyof DiagnosticsConfig = 'definedWithinEntry';
    const base = `Entry file "${entryPath}" exports code it defines and imports code from other modules.`;
    return {
      base,
      name,
      message:
        `${base} Such imports are never cleaned up because they could have side-effects and be consumed by` +
        ` code defined by the entry file. Determining whether such imports are unused could be expensive.` +
        ` This means that if you were to import any entity defined by that entry file, it could result in unnecessary requests.` +
        `\n` +
        `You may ignore this warning by setting the \`diagnostics.definedWithinEntry\` option to false.`,
    };
  },

  maxDepthReached: (path: string, importedFrom: string) => {
    const name: keyof DiagnosticsConfig = 'maxDepthReached';
    const base = `Max depth reached at path "${importedFrom}", skipping wildcard import analysis of "${path}"…`;
    return {
      base,
      name,
      message:
        `${base} Such imports are never cleaned up because they could have side-effects and be consumed by` +
        ` code defined by the entry file. Determining whether such imports are unused could be expensive.` +
        ` This means that if you were to import any entity defined by that entry file, it could result in unnecessary requests.` +
        `\n` +
        `You may ignore this warning by setting the \`diagnostics.definedWithinEntry\` option to false.`,
    };
  },
};
