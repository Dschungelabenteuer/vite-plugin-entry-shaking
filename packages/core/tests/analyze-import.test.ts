import fs from 'fs';
import MagicString from 'magic-string';
import { resolve } from 'path';
import dedent from 'ts-dedent';
import { normalizePath } from 'vite';
import type { MockedFunction } from 'vitest';
import { describe, it, expect, vi } from 'vitest';
import ImportAnalyzer from '../src/analyze-import';

vi.mock('fs');

describe('getImportedNamedExports', () => {
  it('should return empty array if there are no named exports', () => {
    const output = ImportAnalyzer.getImportedNamedExports(``, 0, 40);

    expect(output).toStrictEqual([]);
  });

  it('should return named exports', () => {
    const path = `@entry/path`;
    const imports = ['UserId', 'UserName', 'User'];
    const exportPrefix = `export {`;
    const exportStart = `${exportPrefix} ${imports.join(', ')} `;
    const input = `${exportStart}} from "${path}"`;
    const output = ImportAnalyzer.getImportedNamedExports(
      input,
      exportPrefix.length - 1,
      exportStart.length + 1,
    );

    expect(output).toStrictEqual(imports);
  });
});

describe('analyzeImport', () => {
  const path = `@entry/path`;
  const absolutePath = '/path/to/entry';
  const imports = ['UserId', 'UserName', 'Test', 'User', 'Groups'];
  const importPrefix = `import {`;
  const importStart = `${importPrefix} ${imports.join(', ')} `;
  const input = `${importStart}} from "${path}";`;
  const entry = new Map([
    ['UserName', { importDefault: false, path: '@models/User' }],
    ['User', { importDefault: false, path: '@models/User', aliasStatement: 'UserId as User' }],
    ['Test', { importDefault: false, path: '@models/Test' }],
    ['Groups', { importDefault: true, path: '@models/Groups' }],
  ]);
  const src = new MagicString(input);

  it('should correctly return mutated entry file', () => {
    (fs.existsSync as MockedFunction<any>).mockImplementation(() => true);
    ImportAnalyzer.analyzeImport(
      src,
      input,
      entry,
      path,
      absolutePath,
      0,
      input.length - 1,
    );

    expect(src.toString()).toStrictEqual(dedent(`
      import { UserId } from '@entry/path';
      import { UserName, UserId as User } from '${normalizePath(resolve(absolutePath, '@models/User'))}';
      import { Test } from '${normalizePath(resolve(absolutePath, '@models/Test'))}';
      import Groups from '${normalizePath(resolve(absolutePath, '@models/Groups'))}';
    `));
  });
});
