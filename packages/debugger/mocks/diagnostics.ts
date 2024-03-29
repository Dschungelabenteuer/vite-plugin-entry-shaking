import type { Diagnostics } from 'vite-plugin-entry-shaking/src/diagnostics';

export function createDiagnostics(entries: any): any {
  const diagnostics: Diagnostics = {};

  return {
    entries,
  };
}
