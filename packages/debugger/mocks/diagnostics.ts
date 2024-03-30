import { faker } from '@faker-js/faker';
import type { Context, Diagnostic } from 'vite-plugin-entry-shaking';
import { DiagnosticKinds } from 'vite-plugin-entry-shaking';

const createMaxDepthReachedDiagnostic = () => {
  const path = faker.system.filePath();
  const entryPath = faker.system.filePath();
  return DiagnosticKinds.maxDepthReached(path, entryPath);
};

const createDefinedWithinEntryDiagnostic = () => {
  const entryPath = faker.system.filePath();
  return DiagnosticKinds.definedWithinEntry(entryPath);
};

export function createDiagnostics(entries: Context['entries']): any {
  const listPerPath = new Map<string, number[]>();
  const list: Diagnostic[] = [];
  [...entries.entries()].forEach(([entryPath, entry]) => {
    if (entry.diagnostics.size) {
      listPerPath.set(entryPath, [...entry.diagnostics.values()]);
      [...entry.diagnostics.values()].forEach(() => {
        list.push(
          faker.datatype.boolean()
            ? createMaxDepthReachedDiagnostic()
            : createDefinedWithinEntryDiagnostic(),
        );
      });
    }
  });

  return {
    list,
    listPerPath,
  };
}
