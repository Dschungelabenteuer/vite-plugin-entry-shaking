import type { ResolveFn } from 'vite';
import type { MockedFunction } from 'vitest';
import fs from 'fs';
import MagicString from 'magic-string';
import { resolve } from 'path';
import dedent from 'ts-dedent';
import { beforeAll, describe, it, expect, vi } from 'vitest';

import ImportAnalyzer from '../src/analyze-import';
import { getTestResolver, MOCKS_FOLDER } from './utils';

vi.mock('fs');

let resolver: ResolveFn;

beforeAll(async () => {
  resolver = await getTestResolver();
});

describe('getImportParams', () => {
  it('should return correct structure when there is no alias', () => {
    const name = 'User';
    expect(ImportAnalyzer.getImportParams(name)).toStrictEqual({
      name,
      alias: undefined,
    });
  });

  it('should return correct structure when there is an alias', () => {
    const name = 'User';
    const alias = 'UserProfile';
    expect(ImportAnalyzer.getImportParams(`${name} as ${alias}`)).toStrictEqual({ name, alias });
  });
});

describe('getImportedNamedExports', () => {
  it('should return empty array if there are no named exports', () => {
    const output = ImportAnalyzer.getImportedNamedExports(``, 0, 40);

    expect(output).toStrictEqual([]);
  });

  it('should return array of imported named entities from entry', () => {
    const path = `@entry/path`;
    const imports = ['UserId', 'UserName', 'User'];
    const exportPrefix = `import {`;
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

describe('getImportsMap', async () => {
  const entryExports = new Map([
    ['A_MODULE_H', { path: './modules/H', importDefault: false, originalName: 'A_MODULE_H' }],
    ['A_MODULE_I', { path: './modules/IJ', importDefault: true, originalName: undefined }],
    ['A_MODULE_J', { path: './modules/IJ', importDefault: false, originalName: 'J' }],
    ['A_MODULE_A', { path: './modules/A', importDefault: true, originalName: undefined }],
    ['A_MODULE_B', { path: './modules/B', importDefault: true, originalName: undefined }],
    ['A_MODULE_C', { path: './modules/C', importDefault: true, originalName: undefined }],
    [
      'A_MODULE_D',
      {
        path: '@mocks/entry-a/modules/D',
        importDefault: true,
        originalName: undefined,
      },
    ],
    [
      'A_MODULE_E',
      {
        path: './modules/EF',
        importDefault: false,
        originalName: 'A_MODULE_E',
      },
    ],
    [
      'A_MODULE_F',
      {
        path: './modules/EF',
        importDefault: false,
        originalName: 'A_MODULE_F',
      },
    ],
    ['A_MODULE_G', { path: './modules/G', importDefault: false, originalName: 'G' }],
  ]);

  it('should correctly feed the import map when importing a named entity [directly exported from entry]', async () => {
    const imports: string[] = ['A_MODULE_A'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entryExports, entryPath, imports, resolver);
    expect(output.size).toStrictEqual(1);
    expect([...output.values()][0][0]).toStrictEqual({
      alias: undefined,
      importDefault: true,
      name: 'A_MODULE_A',
      originalName: undefined,
    });
  });

  it('should correctly feed the import map when [importing twice] a named entity [directly exported from entry]', async () => {
    const imports: string[] = ['A_MODULE_A', 'A_MODULE_A as A_COPY'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entryExports, entryPath, imports, resolver);
    expect(output.size).toStrictEqual(1);
    expect([...output.values()][0][0]).toStrictEqual({
      alias: undefined,
      importDefault: true,
      name: 'A_MODULE_A',
      originalName: undefined,
    });
  });

  it('should correctly feed the import map when [importing with alias] a named entity [directly exported from entry]', async () => {
    const imports: string[] = ['A_MODULE_B as B'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entryExports, entryPath, imports, resolver);
    expect(output.size).toStrictEqual(1);
    expect([...output.values()][0][0]).toStrictEqual({
      alias: 'B',
      importDefault: true,
      name: 'A_MODULE_B',
      originalName: undefined,
    });
  });

  it('should correctly feed the import map when importing a named entity [exported from entry via an alias]', async () => {
    const imports: string[] = ['A_MODULE_G'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entryExports, entryPath, imports, resolver);
    expect(output.size).toStrictEqual(1);
    expect([...output.values()][0][0]).toStrictEqual({
      alias: undefined,
      importDefault: false,
      name: 'A_MODULE_G',
      originalName: 'G',
    });
  });

  it('should correctly feed the import map when [importing with alias] a named entity [exported from entry via an alias]', async () => {
    const imports: string[] = ['A_MODULE_J as JJ'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entryExports, entryPath, imports, resolver);
    expect(output.size).toStrictEqual(1);
    expect([...output.values()][0][0]).toStrictEqual({
      alias: 'JJ',
      importDefault: false,
      name: 'A_MODULE_J',
      originalName: 'J',
    });
  });

  it('should correctly feed the import map when importing a named entity [exported from entry via a path alias]', async () => {
    /** Note: this requires `resolver` to be set using the mocked vite configuration. */
    const imports: string[] = ['A_MODULE_D'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entryExports, entryPath, imports, resolver);
    expect(output.size).toStrictEqual(1);
    expect([...output.values()][0][0]).toStrictEqual({
      alias: undefined,
      importDefault: true,
      name: 'A_MODULE_D',
      originalName: undefined,
    });
  });

  it('should correctly feed the import map when importing a named entity [directly defined in entry]', async () => {
    const imports: string[] = ['test'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entryExports, entryPath, imports, resolver);
    expect(output.size).toStrictEqual(1);
    expect([...output.values()][0][0]).toStrictEqual({
      importDefault: false,
      name: 'test',
    });
  });
});

describe('formatImportReplacement', () => {
  it('should correctly format import which resolves to the default export of the target module', () => {
    const name = 'A';
    const importDefault = true;

    expect(
      ImportAnalyzer.formatImportReplacement({
        name,
        alias: undefined,
        originalName: undefined,
        importDefault,
      }),
    ).toStrictEqual(`default as A`);

    expect(
      ImportAnalyzer.formatImportReplacement({
        name,
        alias: 'A_RENAMED',
        originalName: undefined,
        importDefault,
      }),
    ).toStrictEqual(`default as A_RENAMED`);

    expect(
      ImportAnalyzer.formatImportReplacement({
        name,
        alias: undefined,
        originalName: 'A_ORIGIN',
        importDefault,
      }),
    ).toStrictEqual(`default as A_ORIGIN`);
  });

  it('should correctly format import which resolves to an aliased import from the entry', () => {
    const name = 'A';
    const importDefault = false;
    const originalName = 'A_ORIGIN';

    expect(
      ImportAnalyzer.formatImportReplacement({
        name,
        alias: undefined,
        originalName,
        importDefault,
      }),
    ).toStrictEqual(`A_ORIGIN as A`);

    expect(
      ImportAnalyzer.formatImportReplacement({
        name,
        alias: 'A_RENAMED',
        originalName,
        importDefault,
      }),
    ).toStrictEqual(`A_ORIGIN as A_RENAMED`);
  });

  it('should correctly format import in remaining cases', () => {
    const name = 'A';
    const importDefault = false;

    expect(
      ImportAnalyzer.formatImportReplacement({
        name,
        alias: undefined,
        originalName: undefined,
        importDefault,
      }),
    ).toStrictEqual(`A`);

    expect(
      ImportAnalyzer.formatImportReplacement({
        name,
        alias: 'A_RENAMED',
        originalName: undefined,
        importDefault,
      }),
    ).toStrictEqual(`A as A_RENAMED`);
  });
});

describe('analyzeImportStatement', () => {
  it('should correctly return mutated entry file', async () => {
    vi.restoreAllMocks();
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER, 'entry-a'))) as string;
    const path = `@mocks/entry-a`;
    const imports = [
      'A_MODULE_A',
      'A_MODULE_A as A_COPY',
      'A_MODULE_B as B',
      'A_MODULE_G',
      'A_MODULE_J as JJ',
      'A_MODULE_D',
      'test',
    ];
    const importPrefix = `import {`;
    const importStart = `${importPrefix} ${imports.join(', ')} `;
    const input = `${importStart}} from "${path}";`;
    const entryExports = new Map([
      [
        'A_MODULE_H',
        {
          path: './modules/H',
          importDefault: false,
          originalName: 'A_MODULE_H',
        },
      ],
      ['A_MODULE_I', { path: './modules/IJ', importDefault: true, originalName: undefined }],
      ['A_MODULE_J', { path: './modules/IJ', importDefault: false, originalName: 'J' }],
      ['A_MODULE_A', { path: './modules/A', importDefault: true, originalName: undefined }],
      ['A_MODULE_B', { path: './modules/B', importDefault: true, originalName: undefined }],
      ['A_MODULE_C', { path: './modules/C', importDefault: true, originalName: undefined }],
      [
        'A_MODULE_D',
        {
          path: '@mocks/entry-a/modules/D',
          importDefault: true,
          originalName: undefined,
        },
      ],
      [
        'A_MODULE_E',
        {
          path: './modules/EF',
          importDefault: false,
          originalName: 'A_MODULE_E',
        },
      ],
      [
        'A_MODULE_F',
        {
          path: './modules/EF',
          importDefault: false,
          originalName: 'A_MODULE_F',
        },
      ],
      ['A_MODULE_G', { path: './modules/G', importDefault: false, originalName: 'G' }],
    ]);
    const src = new MagicString(input);
    (fs.existsSync as MockedFunction<any>).mockImplementation(() => true);
    await ImportAnalyzer.analyzeImportStatement(
      src,
      input,
      entryExports,
      entryPath,
      0,
      input.length - 1,
      resolver,
    );

    expect(src.toString()).toStrictEqual(
      dedent(`
      import { test } from '${entryPath}';
      import { default as A_MODULE_A, default as A_COPY } from '${await resolver(
        `${path}/modules/A.ts`,
      )}';
      import { default as B } from '${await resolver(`${path}/modules/B.ts`)}';
      import { G as A_MODULE_G } from '${await resolver(`${path}/modules/G.ts`)}';
      import { J as JJ } from '${await resolver(`${path}/modules/IJ.ts`)}';
      import { default as A_MODULE_D } from '${await resolver(`${path}/modules/D.ts`)}';
    `),
    );
  });
});
