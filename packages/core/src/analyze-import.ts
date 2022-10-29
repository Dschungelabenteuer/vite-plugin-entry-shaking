import type MagicString from 'magic-string';
import { resolve } from 'path';
import { normalizePath } from 'vite';

import type { EntryExports, ImportInput, TargetAbsolutePath, TargetPath } from './types';

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
  const imported: Map<string, ImportInput[]> = new Map([]);
  const namedImports = getImportedNamedExports(
    code,
    statementStartPosition,
    statementEndPosition,
  );

  namedImports.forEach((importedItem) => {
    const name = importedItem.trim();
    const namedImport = entry.get(name);
    if (namedImport) {
      const resolvedPath = normalizePath(resolve(targetAbsolutePath, namedImport.path));
      const { importDefault, aliasStatement } = namedImport;
      imported.set(resolvedPath, [
        ...(imported.get(resolvedPath) ?? []),
        { name, importDefault, aliasStatement },
      ]);
    } else {
      imported.set(targetPath, [
        ...(imported.get(targetPath) ?? []),
        { name, importDefault: false },
      ]);
    }
  });

  imported.forEach((importedItems, importedPath) => {
    const path = normalizePath(importedPath);
    if (importedItems.length === 1 && importedItems[0].importDefault === true) {
      replacement.push(`import ${importedItems[0].name} from '${path}'`);
    } else {
      const imports = importedItems.map(({ name, aliasStatement }) => aliasStatement ?? name);
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
