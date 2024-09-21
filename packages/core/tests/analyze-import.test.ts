import fs from 'fs';
import { resolve } from 'path';
import type { ResolveFn } from 'vite';
import MagicString from 'magic-string';
import dedent from 'ts-dedent';
import { beforeAll, describe, it, expect, vi, beforeEach } from 'vitest';

import ImportAnalyzer from '../src/analyze-import';
import { MOCK_IMPORT_INPUT, MOCKS_FOLDER_UNIT, STUB_PATH } from './utils';
import { createTestContext, getTestResolver, resolveUnitEntry } from './utils';
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
        diagnostics: new Set(),
        time: 0,
        self: 0,
        hits: 0,
        importsCount: 0,
        depth: 0,
      },
    ],
  ]);

beforeAll(async () => {
  resolver = await getTestResolver();
});

describe('analyzeImportStatement', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should ignore wildcard import statements', async () => {
    const entry = { exports: new Map() } as EntryData;
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-c')))!;
    const what = 'import * as Utils';
    const input = `${what} from "./entry-c";`;
    const output = `${what} from "${entryPath}?source=1";`;
    const src = new MagicString(input);
    const ctx = await createTestContext({ targets: [] });
    ctx.entries = getEntries(entryPath);

    vi.mocked(fs.existsSync).mockImplementation(() => true);
    await ImportAnalyzer.analyzeImportStatement(
      ctx,
      src,
      input,
      entry, // Irrelevant for this test's puprposes
      entryPath,
      0,
      input.length - 1,
    );

    const res = src.toString().toLocaleLowerCase();
    const expected = output.toLocaleLowerCase();
    expect(res).toStrictEqual(expected);
  });

  it('should correctly mutate file', async () => {
    vi.restoreAllMocks();
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a')))!;
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
    const ctx = await createTestContext({ targets: [] });
    vi.mocked(fs.existsSync).mockImplementation(() => true);
    await ImportAnalyzer.analyzeImportStatement(
      ctx,
      src,
      input,
      entry,
      entryPath,
      0,
      input.length - 1,
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

describe('getImportedEntryExports', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

describe('getImportsMap', async () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

  const _ = (output: TargetImports) => [...output.values()][0][0];
  const ctx = await createTestContext({ targets: ['@mocks/entry-a'] });
  ctx.entries = new Map([['@mocks/entry-a', entry]]);

  it('should correctly feed the import map when importing a named entity [directly exported from entry]', async () => {
    const name = 'A_MODULE_A';
    const imports: string[] = [name];
    const entryPath = await resolveUnitEntry('entry-a');
    const output = await ImportAnalyzer.getImportsMap(ctx, entry, entryPath, imports);
    expect(output.size).toStrictEqual(1);
    expect(_(output)).toStrictEqual({
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
    const output = await ImportAnalyzer.getImportsMap(ctx, entry, entryPath, imports);
    expect(output.size).toStrictEqual(1);
    expect(_(output)).toStrictEqual({
      name,
      alias: undefined,
      importDefault: true,
      originalName: undefined,
    });
  });

  it('should correctly feed the import map when [importing with alias] a named entity [directly exported from entry]', async () => {
    const imports: string[] = ['A_MODULE_B as B'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a')))!;
    const output = await ImportAnalyzer.getImportsMap(ctx, entry, entryPath, imports);
    expect(output.size).toStrictEqual(1);
    expect(_(output)).toStrictEqual({
      alias: 'B',
      importDefault: true,
      name: 'A_MODULE_B',
      originalName: undefined,
    });
  });

  it('should correctly feed the import map when importing a named entity [exported from entry via an alias]', async () => {
    const imports: string[] = ['A_MODULE_G'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a')))!;
    const output = await ImportAnalyzer.getImportsMap(ctx, entry, entryPath, imports);
    expect(output.size).toStrictEqual(1);
    expect(_(output)).toStrictEqual({
      alias: undefined,
      importDefault: false,
      name: 'A_MODULE_G',
      originalName: 'G',
    });
  });

  it('should correctly feed the import map when [importing with alias] a named entity [exported from entry via an alias]', async () => {
    const imports: string[] = ['A_MODULE_J as JJ'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a')))!;
    const output = await ImportAnalyzer.getImportsMap(ctx, entry, entryPath, imports);
    expect(output.size).toStrictEqual(1);
    expect(_(output)).toStrictEqual({
      alias: 'JJ',
      importDefault: false,
      name: 'A_MODULE_J',
      originalName: 'J',
    });
  });

  it('should correctly feed the import map when importing a named entity [exported from entry via a path alias]', async () => {
    /** Note: this requires `resolver` to be set using the mocked vite configuration. */
    const imports: string[] = ['A_MODULE_D'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a')))!;
    const output = await ImportAnalyzer.getImportsMap(ctx, entry, entryPath, imports);
    expect(output.size).toStrictEqual(1);
    expect(_(output)).toStrictEqual({
      alias: undefined,
      importDefault: true,
      name: 'A_MODULE_D',
      originalName: undefined,
    });
  });

  it('should correctly feed the import map when importing a named entity [directly defined in entry]', async () => {
    const imports: string[] = ['test'];
    const entryPath = (await resolver(resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a')))!;
    const output = await ImportAnalyzer.getImportsMap(ctx, entry, entryPath, imports);
    expect(output.size).toStrictEqual(1);
    expect(_(output)).toStrictEqual({
      importDefault: false,
      name: 'test',
    });
  });
});

describe('resolveImport', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(ImportAnalyzer, 'findNamedImport');
    vi.spyOn(ImportAnalyzer, 'findNamedWildcard');
    vi.spyOn(ImportAnalyzer, 'findDirectWildcardExports');
  });

  const notFound = () => Promise.resolve(undefined);
  const found = () => Promise.resolve({} as any);

  // Some naive testing about the execution logic, further tests are handled by the 3 cases.

  it('should work correctly when finding a named import', async () => {
    const ctx = await createTestContext({ targets: [] });
    vi.spyOn(ImportAnalyzer, 'findNamedImport').mockImplementationOnce(found);
    await ImportAnalyzer.resolveImport(ctx, {} as any, '', new Map(), '', '');
    expect(ImportAnalyzer.findNamedImport).toHaveBeenCalled();
    expect(ImportAnalyzer.findNamedWildcard).not.toHaveBeenCalled();
    expect(ImportAnalyzer.findDirectWildcardExports).not.toHaveBeenCalled();
  });

  it('should work correctly when finding a named wildcard', async () => {
    const ctx = await createTestContext({ targets: [] });
    vi.spyOn(ImportAnalyzer, 'findNamedImport').mockImplementationOnce(notFound);
    vi.spyOn(ImportAnalyzer, 'findNamedWildcard').mockImplementationOnce(found);
    await ImportAnalyzer.resolveImport(ctx, {} as any, '', new Map(), '', '');
    expect(ImportAnalyzer.findNamedImport).toHaveBeenCalled();
    expect(ImportAnalyzer.findNamedWildcard).toHaveBeenCalled();
    expect(ImportAnalyzer.findDirectWildcardExports).not.toHaveBeenCalled();
  });

  it('should work correctly when finding a direct exported wildcard', async () => {
    const ctx = await createTestContext({ targets: [] });
    vi.spyOn(ImportAnalyzer, 'findNamedImport').mockImplementationOnce(notFound);
    vi.spyOn(ImportAnalyzer, 'findNamedWildcard').mockImplementationOnce(notFound);
    vi.spyOn(ImportAnalyzer, 'findDirectWildcardExports').mockImplementationOnce(found);
    await ImportAnalyzer.resolveImport(ctx, {} as any, '', new Map(), '', '');
    expect(ImportAnalyzer.findNamedImport).toHaveBeenCalled();
    expect(ImportAnalyzer.findNamedWildcard).toHaveBeenCalled();
    expect(ImportAnalyzer.findDirectWildcardExports).toHaveBeenCalled();
  });
});

describe('findNamedImport', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should not do/return anything if name is not part of entry exports', async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const alias = 'alias';
    const ctx = await createTestContext({ targets: [] });
    const entry = { exports: new Map() } as EntryData;
    const map = new Map() as TargetImports;

    const output = await ImportAnalyzer.findNamedImport(ctx, entry, entryPath, map, name, alias);

    expect(output).toStrictEqual(undefined);
    expect(map.size).toStrictEqual(0);
  });

  it('should not do/return anything if matched entry exports cannot be resolved', async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const alias = 'alias';
    const ctx = await createTestContext({ targets: [] });
    const entry = { exports: new Map([[name, { path: 'path/to/export' }]]) } as EntryData;
    const map = new Map();

    const output = await ImportAnalyzer.findNamedImport(ctx, entry, entryPath, map, name, alias);

    expect(output).toStrictEqual(undefined);
    expect(map.size).toStrictEqual(0);
  });

  it('should register named import to map and return true if it was found and resolved', async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const alias = 'alias';
    const resolvedPath = 'path/to/export';
    const ctx = await createTestContext({ targets: [] });
    const entry = { exports: new Map([[name, { path: 'path/to/export' }]]) } as EntryData;
    const map = new Map() as TargetImports;
    vi.spyOn(ctx, 'resolver').mockImplementationOnce(() => Promise.resolve(resolvedPath));

    const output = await ImportAnalyzer.findNamedImport(ctx, entry, entryPath, map, name, alias);

    expect(output).toStrictEqual(true);
    expect(map.size).toStrictEqual(1);
  });

  it('should merge target imports if it was found and resolved', async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const alias = 'alias';
    const resolvedPath = 'path/to/export';
    const ctx = await createTestContext({ targets: [] });
    const entry = { exports: new Map([[name, { path: 'path/to/export' }]]) } as EntryData;
    const map = new Map([[resolvedPath, [{ name: 'first' }]]]) as TargetImports;
    vi.spyOn(ctx, 'resolver').mockImplementationOnce(() => Promise.resolve(resolvedPath));

    const output = await ImportAnalyzer.findNamedImport(ctx, entry, entryPath, map, name, alias);

    expect(output).toStrictEqual(true);
    expect(map.get(resolvedPath)?.length).toStrictEqual(2);
  });
});

describe('findNamedWildcard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not do/return anything if name is not part of entry's named wildcard exports", async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const ctx = await createTestContext({ targets: [] });
    const entry = { wildcardExports: { named: new Map() } } as EntryData;
    const map = new Map() as TargetImports;

    const output = await ImportAnalyzer.findNamedWildcard(ctx, entry, entryPath, map, name);

    expect(output).toStrictEqual(undefined);
    expect(map.size).toStrictEqual(0);
  });

  it("should not do/return anything if matched entry's named wildcard exports cannot be resolved", async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const ctx = await createTestContext({ targets: [] });
    const entry = { wildcardExports: { named: new Map() } } as EntryData;
    const map = new Map() as TargetImports;

    const output = await ImportAnalyzer.findNamedWildcard(ctx, entry, entryPath, map, name);

    expect(output).toStrictEqual(undefined);
    expect(map.size).toStrictEqual(0);
  });

  it("should not do/return anything if matched entry's named wildcard is not an entry", async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const resolvedPath = 'path/to/export';
    const ctx = await createTestContext({ targets: [] });
    const entry = { wildcardExports: { named: new Map([[name, {} as any]]) } } as EntryData;
    const map = new Map() as TargetImports;

    vi.spyOn(ctx, 'resolver').mockImplementationOnce(() => Promise.resolve(resolvedPath));
    const output = await ImportAnalyzer.findNamedWildcard(ctx, entry, entryPath, map, name);

    expect(output).toStrictEqual(undefined);
    expect(map.size).toStrictEqual(0);
  });

  it('should register to map and return true if it was found, resolved and is an entry', async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const resolvedPath = 'path/to/export';
    const ctx = await createTestContext({ targets: [] });
    ctx.entries = new Map([[resolvedPath, {} as EntryData]]);
    const entry = { wildcardExports: { named: new Map([[name, {} as any]]) } } as EntryData;
    const map = new Map() as TargetImports;
    vi.spyOn(ctx, 'resolver').mockImplementationOnce(() => Promise.resolve(resolvedPath));

    const output = await ImportAnalyzer.findNamedWildcard(ctx, entry, entryPath, map, name);

    expect(output).toStrictEqual(true);
    expect(map.size).toStrictEqual(1);
  });

  it('should merge target imports if all requirements are met', async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const resolvedPath = 'path/to/export';
    const ctx = await createTestContext({ targets: [] });
    ctx.entries = new Map([[resolvedPath, {} as EntryData]]);
    const entry = { wildcardExports: { named: new Map([[name, {} as any]]) } } as EntryData;
    const map = new Map([[resolvedPath, [{ name: 'first' }]]]) as TargetImports;
    vi.spyOn(ctx, 'resolver').mockImplementationOnce(() => Promise.resolve(resolvedPath));

    const output = await ImportAnalyzer.findNamedWildcard(ctx, entry, entryPath, map, name);

    expect(output).toStrictEqual(true);
    expect(map.size).toStrictEqual(1);
  });
});

describe('findDirectWildcardExports', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(ImportAnalyzer, 'resolveImport');
  });

  it('should not do/return anything if direct-exported path could not be resolved', async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const alias = 'alias';
    const ctx = await createTestContext({ targets: [] });
    const entry = { wildcardExports: { direct: [] as string[] } } as EntryData;
    const map = new Map() as TargetImports;

    const fn = ImportAnalyzer.findDirectWildcardExports;
    const output = await fn(ctx, entry, entryPath, map, name, alias);

    expect(output).toStrictEqual(undefined);
    expect(map.size).toStrictEqual(0);
    expect(ImportAnalyzer.resolveImport).not.toHaveBeenCalled();
  });

  it('should register to map and return true if resolved direct-exported path has an export of the given name', async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const alias = 'alias';
    const resolvedPath = 'path/to/export';
    const ctx = await createTestContext({ targets: [] });
    ctx.entries = new Map([[resolvedPath, { exports: new Map([[name, {}]]) } as EntryData]]);
    const entry = { wildcardExports: { direct: ['path/to/import'] as string[] } } as EntryData;
    const map = new Map() as TargetImports;
    vi.spyOn(ctx, 'resolver').mockImplementationOnce(() => Promise.resolve(resolvedPath));

    const fn = ImportAnalyzer.findDirectWildcardExports;
    const output = await fn(ctx, entry, entryPath, map, name, alias);

    expect(output).toStrictEqual(true);
    expect(map.size).toStrictEqual(1);
    expect(ImportAnalyzer.resolveImport).not.toHaveBeenCalled();
  });

  it('should merge target imports if resolved direct-exported path has an export of the given name', async () => {
    const entryPath = 'path/to/entry';
    const name = 'name';
    const alias = 'alias';
    const resolvedPath = 'path/to/export';
    const ctx = await createTestContext({ targets: [] });
    ctx.entries = new Map([[resolvedPath, { exports: new Map([[name, {}]]) } as EntryData]]);
    const entry = { wildcardExports: { direct: ['path/to/import'] as string[] } } as EntryData;
    const map = new Map() as TargetImports;
    vi.spyOn(ctx, 'resolver').mockImplementationOnce(() => Promise.resolve(resolvedPath));

    const fn = ImportAnalyzer.findDirectWildcardExports;
    const output = await fn(ctx, entry, entryPath, map, name, alias);

    expect(output).toStrictEqual(true);
    expect(map.size).toStrictEqual(1);
    expect(ImportAnalyzer.resolveImport).not.toHaveBeenCalled();
  });

  describe('should recursively resolve import if resolved direct-exported does not have an export of the given name and has registered wildcard exports', () => {
    it('should return true if recursive called ended up resolving the export', async () => {
      const entryPath = 'path/to/entry';
      const name = 'name';
      const alias = 'alias';
      const resolvedPath = 'path/to/export';
      const ctx = await createTestContext({ targets: [] });
      ctx.entries = new Map([
        [resolvedPath, { exports: new Map(), wildcardExports: { named: new Map() } } as EntryData],
      ]);
      const entry = { wildcardExports: { direct: ['path/to/import'] as string[] } } as EntryData;
      const map = new Map() as TargetImports;
      vi.spyOn(ctx, 'resolver').mockImplementationOnce(() => Promise.resolve(resolvedPath));
      vi.spyOn(ImportAnalyzer, 'resolveImport').mockImplementationOnce(() => Promise.resolve(true));

      const fn = ImportAnalyzer.findDirectWildcardExports;
      const output = await fn(ctx, entry, entryPath, map, name, alias);

      expect(output).toStrictEqual(true);
      expect(ImportAnalyzer.resolveImport).toHaveBeenCalled();
    });

    it("should not return anything if recursive call could not find the exported entity's source", async () => {
      const entryPath = 'path/to/entry';
      const name = 'name';
      const alias = 'alias';
      const resolvedPath = 'path/to/export';
      const ctx = await createTestContext({ targets: [] });
      ctx.entries = new Map([
        [resolvedPath, { exports: new Map(), wildcardExports: { named: new Map() } } as EntryData],
      ]);
      const entry = { wildcardExports: { direct: ['path/to/import'] as string[] } } as EntryData;
      const map = new Map() as TargetImports;
      vi.spyOn(ctx, 'resolver').mockImplementationOnce(() => Promise.resolve(resolvedPath));
      vi.spyOn(ImportAnalyzer, 'resolveImport').mockImplementationOnce(() =>
        Promise.resolve(false),
      );

      const fn = ImportAnalyzer.findDirectWildcardExports;
      const output = await fn(ctx, entry, entryPath, map, name, alias);

      expect(output).toStrictEqual(undefined);
      expect(ImportAnalyzer.resolveImport).toHaveBeenCalled();
    });
  });
});

describe('getImportReplacements', () => {
  it('should call resolveImportedEntities for each import', async () => {
    vi.spyOn(ImportAnalyzer, 'resolveImportedEntities');
    const ctx = await createTestContext({ targets: [] });
    ctx.entries = new Map([['entry', {} as EntryData]]);
    const imports: TargetImports = new Map([
      ['first', [MOCK_IMPORT_INPUT]],
      ['second', [MOCK_IMPORT_INPUT, MOCK_IMPORT_INPUT]],
    ]);

    const output = await ImportAnalyzer.getImportReplacements(ctx, imports, STUB_PATH);

    expect(ImportAnalyzer.resolveImportedEntities).toHaveBeenCalledTimes(2);
    expect(Array.isArray(output)).toStrictEqual(true);
  });
});

describe('resolveImportedEntities', () => {
  const expectedFn = 'resolveImportedCircularEntities';
  const when = 'from different target entries';
  const imported: ImportInput[] = [MOCK_IMPORT_INPUT];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(ImportAnalyzer, 'resolveImportedCircularEntities');
    vi.spyOn(ImportAnalyzer, 'formatImportReplacement');
  });

  it(`should call "${expectedFn}" if there are circular imports ${when}`, async () => {
    const entryPath = 'entryA';
    const path = 'entryB';
    const ctx = await createTestContext({ targets: [] });
    ctx.entries = new Map([['entryB', { exports: new Map() } as EntryData]]);
    await ImportAnalyzer.resolveImportedEntities(ctx, imported, entryPath, path);
    expect(ImportAnalyzer.resolveImportedCircularEntities).toHaveBeenCalledWith(
      ctx,
      imported,
      path,
    );
  });

  it(`should not call "${expectedFn}" if there are no circular imports ${when}`, async () => {
    const entryPath = 'entryA';
    const path = 'entryA';
    const ctx = await createTestContext({ targets: [] });
    ctx.entries = new Map([['entryB', { exports: new Map() } as EntryData]]);
    await ImportAnalyzer.resolveImportedEntities(ctx, imported, entryPath, path);
    expect(ImportAnalyzer.resolveImportedCircularEntities).not.toHaveBeenCalled();
    expect(ImportAnalyzer.formatImportReplacement).toHaveBeenCalledTimes(imported.length);
  });
});

/** Let's rely on syntax-related integration tests for now, it seems exhausting testing this. */
describe.todo('resolveImportedCircularEntities', () => {
  // …
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

describe('catchWildcardImport', () => {
  const entryPath = 'path/to/entry';

  it('should return true and rewrite if the import is a wildcard import', () => {
    const input = `import * as Utils from './somewhere';`;
    const src = new MagicString(input);
    const output = ImportAnalyzer.catchWildcardImport(src, input, 0, input.length - 1, entryPath);
    expect(output).toStrictEqual(true);
    expect(src.toString()).toStrictEqual(`import * as Utils from "${entryPath}?source=1";`);
  });

  it('should return false and not rewrite if the import is not a wildcard import', () => {
    const input = `import { Something as Utils } from './somewhere';`;
    const src = new MagicString(input);
    const output = ImportAnalyzer.catchWildcardImport(src, input, 0, input.length - 1, entryPath);
    expect(output).toStrictEqual(false);
    expect(src.toString()).toStrictEqual(input);
  });
});

describe('catchDynamicImport', () => {
  const entryPath = 'path/to/entry';

  /**
   * Next two suites suppose the following statement:
   * `const { Utils } = await import('path/to/entry');`
   */

  it('should return true and rewrite if the import is a dynamic import', () => {
    const input = `import('${entryPath}')`;
    const src = new MagicString(input);
    const output = ImportAnalyzer.catchDynamicImport(src, input, 0, input.length, entryPath);
    expect(output).toStrictEqual(true);
    expect(src.toString()).toStrictEqual(`import('${entryPath}?source=1')`);
  });

  const commentCases = {
    before: `import(/* @vite-ignore */ '${entryPath}')`,
    after: `import(/* @vite-ignore */ '${entryPath}')`,
    multiline: `import(
      /* @vite-ignore */
      '${entryPath}'
    )`,
  };

  Object.entries(commentCases).forEach(([name, input]) => {
    it(`should return true but not rewrite if the import is a dynamic import with a vite-ignore comment ${name}`, () => {
      const src = new MagicString(input);
      const output = ImportAnalyzer.catchDynamicImport(src, input, 0, input.length, entryPath);
      expect(output).toStrictEqual(true);
      expect(src.toString()).toStrictEqual(input);
    });
  });

  it('should return false and not rewrite if the import is not a dynamic import', () => {
    const input = `import { Something as Utils } from './somewhere';`;
    const src = new MagicString(input);
    const output = ImportAnalyzer.catchDynamicImport(src, input, 0, input.length - 1, entryPath);
    expect(output).toStrictEqual(false);
    expect(src.toString()).toStrictEqual(input);
  });
});
