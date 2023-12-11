import fs from 'fs';
import { resolve } from 'path';
import type { ResolveFn } from 'vite';
import MagicString from 'magic-string';
import dedent from 'ts-dedent';
import { beforeAll, describe, it, expect, vi, beforeEach } from 'vitest';

import ImportAnalyzer from '../src/analyze-import';
import {
  getTestResolver,
  MOCK_IMPORT_INPUT,
  MOCKS_FOLDER_UNIT,
  resolveUnitEntry,
  STUB_PATH,
} from './utils';
import type { EntryData, ImportInput, PluginEntries, TargetImports } from '../src/types';

vi.mock('fs');

let resolver: ResolveFn;

const getEntries = (entryPath: string): PluginEntries =>
  new Map([
    [
      entryPath,
      {
        exports: new Map([['A_MODULE_A', { path: './modules/A', importDefault: true }]]),
        source: '',
        updatedSource: '',
        depth: 0,
      },
    ],
  ]);

beforeAll(async () => {
  resolver = await getTestResolver();
});

describe('getImportedEntryExports', () => {
  it('should return empty array if there are no named exports', () => {
    const output = ImportAnalyzer.getImportedEntryExports(``, 0, 40);
    expect(output).toStrictEqual([]);
  });

  it('should return array of imported named entities from entry', () => {
    const path = `@entry/path`;
    const imports = ['UserId', 'UserName', 'User'];
    const statement = `import { ${imports.join(', ')} } from "${path}"`;
    const output = ImportAnalyzer.getImportedEntryExports(statement, 0, statement.length - 1);

    expect(output).toStrictEqual(imports);
  });

  it('should return array of imported named entities from entry (mixed)', () => {
    const path = `@entry/path`;
    const imports = ['UserId', 'UserName', 'User'];
    const defaultImport = 'Def';
    const statement = `import ${defaultImport}, { ${imports.join(', ')} } from "${path}"`;
    const output = ImportAnalyzer.getImportedEntryExports(statement, 0, statement.length - 1);

    expect(output).toStrictEqual([...imports, `default as ${defaultImport}`]);
  });
});

describe('getImportsMap', () => {
  const entry = {
    exports: new Map([
      ['A_MODULE_H', { path: './modules/H', importDefault: false, originalName: 'A_MODULE_H' }],
      ['A_MODULE_I', { path: './modules/IJ', importDefault: true, originalName: undefined }],
      ['A_MODULE_J', { path: './modules/IJ', importDefault: false, originalName: 'J' }],
      ['A_MODULE_A', { path: './modules/A', importDefault: true, originalName: undefined }],
      ['A_MODULE_B', { path: './modules/B', importDefault: true, originalName: undefined }],
      ['A_MODULE_C', { path: './modules/C', importDefault: true, originalName: undefined }],
      [
        'A_MODULE_D',
        { path: '@mocks/entry-a/modules/D', importDefault: true, originalName: undefined },
      ],
      ['A_MODULE_E', { path: './modules/EF', importDefault: false, originalName: 'A_MODULE_E' }],
      ['A_MODULE_F', { path: './modules/EF', importDefault: false, originalName: 'A_MODULE_F' }],
      ['A_MODULE_G', { path: './modules/G', importDefault: false, originalName: 'G' }],
    ]),
  } as EntryData;

  const entries = new Map([['@mocks/entry-a', entry]]);

  it('should correctly feed the import map when importing a named entity [directly exported from entry]', async () => {
    const name = 'A_MODULE_A';
    const imports: string[] = [name];
    const entryPath = await resolveUnitEntry('entry-a');
    const output = await ImportAnalyzer.getImportsMap(entries, entry, entryPath, imports, resolver);
    expect(output.size).toStrictEqual(1);
    expect([...output.values()][0][0]).toStrictEqual({
      name,
      alias: undefined,
      importDefault: true,
      originalName: undefined,
    });
  });

  it('should correctly feed the import map when [importing twice] a named entity [directly exported from entry]', async () => {
    const name = 'A_MODULE_A';
    const imports: string[] = [name, `${name} as A_COPY`];
    const entryPath = await resolveUnitEntry('entry-a');
    const output = await ImportAnalyzer.getImportsMap(entries, entry, entryPath, imports, resolver);
    expect(output.size).toStrictEqual(1);
    expect([...output.values()][0][0]).toStrictEqual({
      name,
      alias: undefined,
      importDefault: true,
      originalName: undefined,
    });
  });

  it('should correctly feed the import map when [importing with alias] a named entity [directly exported from entry]', async () => {
    const imports: string[] = ['A_MODULE_B as B'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entries, entry, entryPath, imports, resolver);
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
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entries, entry, entryPath, imports, resolver);
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
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entries, entry, entryPath, imports, resolver);
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
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entries, entry, entryPath, imports, resolver);
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
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a'))) as string;
    const output = await ImportAnalyzer.getImportsMap(entries, entry, entryPath, imports, resolver);
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

describe('getImportReplacements', () => {
  it('should call resolveImportedEntities for each import', async () => {
    vi.spyOn(ImportAnalyzer, 'resolveImportedEntities');
    const entries = new Map([['entry', {} as EntryData]]);
    const imports: TargetImports = new Map([
      ['first', [MOCK_IMPORT_INPUT]],
      ['second', [MOCK_IMPORT_INPUT, MOCK_IMPORT_INPUT]],
    ]);

    const output = await ImportAnalyzer.getImportReplacements(
      imports,
      STUB_PATH,
      entries,
      resolver,
    );

    expect(ImportAnalyzer.resolveImportedEntities).toHaveBeenCalledTimes(2);
    expect(Array.isArray(output)).toStrictEqual(true);
  });
});

describe('resolveImportedEntities', () => {
  const expectedFn = 'resolveImportedCircularEntities';
  const when = 'from different target entries';
  const imported: ImportInput[] = [MOCK_IMPORT_INPUT];
  const entries: PluginEntries = new Map([['entryB', { exports: new Map() } as EntryData]]);

  beforeEach(() => {
    vi.spyOn(ImportAnalyzer, 'resolveImportedCircularEntities');
    vi.spyOn(ImportAnalyzer, 'formatImportReplacement');
  });

  it(`should call "${expectedFn}" if there is circular imports ${when}`, async () => {
    const entryPath = 'entryA';
    const path = 'entryB';
    await ImportAnalyzer.resolveImportedEntities(imported, entryPath, entries, resolver, path);
    expect(ImportAnalyzer.resolveImportedCircularEntities).toHaveBeenCalledWith(
      imported,
      entries,
      resolver,
      path,
    );
  });

  it(`should not call "${expectedFn}" if there is no circular imports ${when}`, async () => {
    const entryPath = 'entryA';
    const path = 'entryA';
    await ImportAnalyzer.resolveImportedEntities(imported, entryPath, entries, resolver, path);
    expect(ImportAnalyzer.resolveImportedCircularEntities).not.toHaveBeenCalled();
    expect(ImportAnalyzer.formatImportReplacement).toHaveBeenCalledTimes(imported.length);
  });
});

describe('analyzeImportStatement', () => {
  it('should ignore wildcard import statements', async () => {
    vi.restoreAllMocks();
    const entry = { exports: new Map() } as EntryData;
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-c'))) as string;
    const what = 'import * as Utils';
    const input = `${what} from "./entry-c";`;
    const output = `${what} from "${entryPath}?source=1";`;
    const src = new MagicString(input);

    vi.mocked(fs.existsSync).mockImplementation(() => true);
    await ImportAnalyzer.analyzeImportStatement(
      src,
      input,
      getEntries(entryPath),
      entry, // Irrelevant for this test's puprposes
      entryPath,
      0,
      input.length - 1,
      resolver,
    );

    const res = src.toString().toLocaleLowerCase();
    const expected = output.toLocaleLowerCase();
    expect(res).toStrictEqual(expected);
  });

  it('should correctly mutate file', async () => {
    vi.restoreAllMocks();
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a'))) as string;
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
    const entry = {
      exports: new Map([
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
      ]),
    } as EntryData;
    const src = new MagicString(input);
    vi.mocked(fs.existsSync).mockImplementation(() => true);
    await ImportAnalyzer.analyzeImportStatement(
      src,
      input,
      getEntries(entryPath),
      entry,
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
