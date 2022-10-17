import type MagicString from 'magic-string';
import { resolve } from 'path';
import { normalizePath } from 'vite';

import type { EntryExports, TargetAbsolutePath, TargetPath } from './types';

/** Returns array of imported target's named exports. */
const getImportedNamedExports = (
  code: string,
  statementStartPosition: number,
  statementEndPosition: number,
): string[] => {
  const [, importContentString] = code.slice(
    statementStartPosition,
    statementEndPosition,
  ).match(/{(.*[^,])}/) ?? [];

  return (importContentString?.split(',') ?? [])
    .map((namedExport) => namedExport.trim());
};

/** Analyzes a single target import. */
export const analyzeImport = (
  src: MagicString,
  code: string,
  entry: EntryExports,
  targetPath: TargetPath,
  targetAbsolutePath: TargetAbsolutePath,
  statementStartPosition: number,
  statementEndPosition: number,
) => {
  const replacement: `import ${string}`[] = [];
  const imported: Map<string, ([string, boolean])[]> = new Map([]);
  const namedImports = getImportedNamedExports(
    code,
    statementStartPosition,
    statementEndPosition,
  );

  namedImports.forEach((importedItem) => {
    const item = importedItem.trim();
    const namedImport = entry.get(item);
    if (namedImport) {
      const resolvedPath = normalizePath(resolve(targetAbsolutePath, namedImport.path));
      imported.set(resolvedPath, [
        ...(imported.get(resolvedPath) ?? []),
        [importedItem.trim(), namedImport.importDefault],
      ]);
    } else {
      imported.set(targetPath, [
        ...(imported.get(targetPath) ?? []),
        [importedItem.trim(), false],
      ]);
    }
  });

  imported.forEach((importedItems, importedPath) => {
    const path = normalizePath(importedPath);
    if (importedItems.length === 1 && importedItems[0][1] === true) {
      replacement.push(`import ${importedItems[0][0]} from '${path}'`);
    } else {
      const imports = importedItems.map(([name]) => name);
      replacement.push(`import { ${imports.join(', ')} } from '${path}'`);
    }
  });

  src.overwrite(
    statementStartPosition,
    statementEndPosition + 1,
    `${replacement.join(';\n')};`,
  );
};

const methods = {
  getImportedNamedExports,
  analyzeImport,
};

export default methods;
