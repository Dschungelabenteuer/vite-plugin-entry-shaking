import type { DiagnosticsConfig, FinalPluginOptions } from './types';

export interface Diagnostic {
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

  constructor(public options: Required<FinalPluginOptions>) {}

  /**
   * Emits a diagnostic.
   * @param name Diagnostic name.
   * @param message Diagnostic message.
   * @param data Diagnostic context data.
   */
  add(name: keyof DiagnosticsConfig, message: string, data?: any): number {
    this.list.push({ name, message, data });
    return this.list.length - 1;
  }

  /**
   * Determines whether a specific diagnostic is enabled.
   * @param name Diagnostic name.
   */
  isEnabled(name: keyof DiagnosticsConfig) {
    return this.options.diagnostics?.[name] === true;
  }
}
