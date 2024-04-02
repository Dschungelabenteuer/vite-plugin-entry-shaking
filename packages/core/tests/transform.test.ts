import type { ExportSpecifier, ImportSpecifier } from 'es-module-lexer';
import dedent from 'ts-dedent';
import { describe, it, expect, beforeAll, vi, beforeEach, afterEach } from 'vitest';

import type { EntryData, PluginEntries, PluginOptions } from '../src/types';
import Transformer from '../src/transform';
import ImportAnalyzer from '../src/analyze-import';
import {
  createMockEntryData,
  createTestContext,
  resolveUnitEntry,
  STUB_ID,
  STUB_SOURCE,
} from './utils';
import type { Context } from '../src/context';

const _a = (name: string) => `@mocks/${_e(name)}`;
const _e = (name: string) => `entry-${name}`;
const ANY_PATH = 'any-path';
const aliasA = _a('a');
const defaultOptions: PluginOptions = {
  extensions: ['ext'],
  maxWildcardDepth: 0,
  diagnostics: false,
  ignorePatterns: [/node_modules/],
  debug: false,
  targets: [],
};

let entryA: string;
let entryAModuleA: string;
let entryB: string;

beforeAll(async () => {
  entryA = await resolveUnitEntry(_e('a'));
  entryB = await resolveUnitEntry(_e('b'));
  entryAModuleA = await resolveUnitEntry(`${_e('a')}/modules/A.ts`);
});

describe('transformIfNeeded', () => {
  beforeAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.spyOn(Transformer, 'transformImportsIfNeeded').mockImplementationOnce(() =>
      Promise.resolve(''),
    );
  });

  it('should call transformImportsIfNeeded when the file is candidate', async () => {
    const res = true;
    const ctx = await createTestContext({ targets: [] });
    vi.spyOn(Transformer, 'requiresTransform').mockImplementationOnce(() => res);
    await Transformer.transformIfNeeded(ctx, STUB_ID, STUB_SOURCE);
    expect(Transformer.transformImportsIfNeeded).toHaveBeenCalled();
  });

  it('should not call transformImportsIfNeeded when the file is not candidate', async () => {
    const res = false;
    const ctx = await createTestContext({ targets: [] });
    vi.spyOn(Transformer, 'requiresTransform').mockImplementationOnce(() => res);
    await Transformer.transformIfNeeded(ctx, STUB_ID, STUB_SOURCE);
    expect(Transformer.transformImportsIfNeeded).not.toHaveBeenCalled();
  });
});

describe('transformImportsIfNeeded', () => {
  beforeAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.spyOn(Transformer, 'transformImports').mockImplementationOnce(() => Promise.resolve(''));
    vi.doMock('es-module-lexer', () => ({ parse: vi.fn().mockReturnValue([]) }));
  });

  afterEach(() => {
    vi.doUnmock('es-module-lexer');
  });

  it('should call transformImports when the file is candidate', async () => {
    const pathToFile = 'path/to/file';
    const res = [pathToFile] as string[];
    const ctx = await createTestContext({ targets: ['path/to/file'] });
    vi.spyOn(Transformer, 'getEntryImports').mockImplementationOnce(() => Promise.resolve(res));
    await Transformer.transformImportsIfNeeded(ctx, STUB_ID, STUB_SOURCE);
    expect(Transformer.transformImports).toHaveBeenCalled();
  });

  it('should not call transformImports when the file is not candidate', async () => {
    const res = [] as string[];
    const ctx = await createTestContext({ targets: [] });
    vi.spyOn(Transformer, 'getEntryImports').mockImplementationOnce(() => Promise.resolve(res));
    await Transformer.transformImportsIfNeeded(ctx, STUB_ID, STUB_SOURCE);
    expect(Transformer.transformImports).not.toHaveBeenCalled();
  });
});

/**
 * Yup, analyzed entries' data are a real pain to mock, but let's not give in to the
 * temptation of manually calling the entry analyzer, and keep it unit-tested rather
 * than relying on other layers to work, those are not integration tests. We do want
 * a clear insight on I/O.
 *
 * Please note that `transformImports` relies on Vite's resolver (which isn't mocked
 * for convinience). The following test suite's therefore meant to be ran against an
 * actual file tree (the `__mocks__/unit` folder).
 */

describe('transformImports', () => {
  beforeAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.spyOn(ImportAnalyzer, 'analyzeImportStatement');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Creates a one-line import statement and returns some parameters.
   * @param content Content of the import statement.
   * @param path Path of the import statement.
   * @param verb Verb of the import statement.
   * @param exports List of exports of the import statement.
   */
  function createOneLineImport<
    const Content extends string,
    const Path extends string,
    const Verb extends 'import' | 'export',
    const Out = `${Verb} ${Content} from '${Path}';`,
  >(content: Content, path: Path, verb?: Verb, exports?: ExportSpecifier[]) {
    const keyword = verb ?? ('import' as Verb);
    const code = `${keyword} ${content} from '${path}';` as Out & string;
    const imps = [{ n: path, ss: 0, se: code.length - 1 }] as unknown as ImportSpecifier[];
    const exps = exports ?? ([] as ExportSpecifier[]);
    return { code, imps, exps };
  }

  const getExpectedParams = (ctx: Context, code: string, entryPath: string) => [
    ctx,
    expect.anything(),
    code,
    ctx.entries.get(entryPath),
    entryPath,
    expect.any(Number),
    expect.any(Number),
  ];

  const MOCK_EMPTY_ENTRY_DATA = createMockEntryData();

  it('should not transform if it does not import any target entry (unresolved import)', async () => {
    const id = STUB_ID;
    const { code, imps, exps } = createOneLineImport('{ anything }', 'anywhere');
    const ctx = await createTestContext({ targets: [entryA] });
    ctx.entries = new Map([[entryA, MOCK_EMPTY_ENTRY_DATA] as const]);

    const out = await Transformer.transformImports(ctx, id, code, imps, exps);
    expect(ImportAnalyzer.analyzeImportStatement).not.toHaveBeenCalled();
    expect(out).toStrictEqual(code);
  });

  it('should not transform if it does not import any target entry (resolved import)', async () => {
    const id = STUB_ID;
    const { code, imps, exps } = createOneLineImport('{ anything }', entryB);
    const ctx = await createTestContext({ targets: [entryA] });
    ctx.entries = new Map([[entryA, MOCK_EMPTY_ENTRY_DATA] as const]);

    const out = await Transformer.transformImports(ctx, id, code, imps, exps);
    expect(ImportAnalyzer.analyzeImportStatement).not.toHaveBeenCalled();
    expect(out).toStrictEqual(code);
  });

  it('should transform if it does import at least one target entry', async () => {
    const id = __dirname;
    const name = 'A_MODULE_A';
    const { code, imps, exps } = createOneLineImport(`{ ${name} }`, aliasA);
    const ctx = await createTestContext({ targets: [entryA] });
    const exports = new Map([[name, { path: './modules/A', importDefault: true }]]);
    ctx.entries = new Map([[entryA, createMockEntryData(exports)]]);

    const out = await Transformer.transformImports(ctx, id, code, imps, exps);
    const params = getExpectedParams(ctx, code, entryA);
    expect(ImportAnalyzer.analyzeImportStatement).toHaveBeenNthCalledWith(1, ...params);
    expect(out).toStrictEqual(dedent(`import { default as ${name} } from '${entryAModuleA}';`));
  });

  it('should transform if it does import multiple target entries', async () => {
    const id = __dirname;
    const nameA = 'A_MODULE_A';
    const nameH = 'A_MODULE_H';
    const { code: aCode, imps: aImps, exps: aExps } = createOneLineImport(`{ ${nameA} }`, aliasA);
    const { code: hCode, imps: hImps, exps: hExps } = createOneLineImport(`{ ${nameH} }`, aliasA);
    const ctx = await createTestContext({ targets: [] });
    const exportsA = new Map([
      [nameA, { path: './modules/A', importDefault: true }],
      [nameH, { path: './modules/H', importDefault: false }],
    ]);
    ctx.entries = new Map([[entryA, createMockEntryData(exportsA)]]);

    // We won't test output, just function calls, so let's merge in a silly way.
    const code = `${aCode}\n${hCode}`;
    const imps = [...aImps, ...hImps];
    const exps = [...aExps, ...hExps];
    await Transformer.transformImports(ctx, id, code, imps, exps);
    const params = getExpectedParams(ctx, code, entryA);
    expect(ImportAnalyzer.analyzeImportStatement).toHaveBeenNthCalledWith(1, ...params);
    expect(ImportAnalyzer.analyzeImportStatement).toHaveBeenNthCalledWith(2, ...params);
  });
});

describe('requiresTransform', () => {
  beforeAll(() => {
    vi.restoreAllMocks();
  });

  it('should return false if served file is ignored', async () => {
    const id = '/path/to/another-project/file.ext';
    const ignorePatterns = [/another-project/];
    const ctx = await createTestContext({ ...defaultOptions, ignorePatterns });
    expect(Transformer.requiresTransform(ctx, id)).toStrictEqual(false);
  });

  it('should return false if served file extension is not within config extension list', async () => {
    const ctx = await createTestContext(defaultOptions);
    const id = '/path/to/project/file.anotherext';
    expect(Transformer.requiresTransform(ctx, id)).toStrictEqual(false);
  });

  it('should return true if served file must be transformed by the plugin', async () => {
    const ctx = await createTestContext(defaultOptions);
    const id = '/path/to/project/file.ext';
    expect(Transformer.requiresTransform(ctx, id)).toStrictEqual(true);
  });
});

describe('getEntryImports', () => {
  const imports = [{ n: aliasA }, { n: undefined }] as ImportSpecifier[];

  beforeAll(() => {
    vi.restoreAllMocks();
  });

  it('should return true if any import targets one of the entries using aliases', async () => {
    // should also work with relative paths and bare imports.
    const ctx = await createTestContext(defaultOptions);
    ctx.entries = new Map([[entryA, {} as EntryData]]);
    const result = await Transformer.getEntryImports(ctx, ANY_PATH, imports);
    expect(result).toStrictEqual([entryA]);
  });

  it('should return false if none of the imports target one of the entries', async () => {
    const ctx = await createTestContext(defaultOptions);
    ctx.entries = new Map([]) as PluginEntries;
    const result = await Transformer.getEntryImports(ctx, ANY_PATH, imports);
    expect(result).toStrictEqual([]);
  });
});

describe('createReexportStatement', () => {
  it('should return valid named re-exports statement', () => {
    const unnamedExport = {};
    const exports = [{ n: 'A_MODULE_A' }, unnamedExport, { n: 'A_MODULE_C' }] as ExportSpecifier[];
    const out = Transformer.createReexportStatement(exports);
    expect(out).toStrictEqual('export { A_MODULE_A,A_MODULE_C };');
  });

  it('should not re-export entities that are already re-exported from a "export { something } from "somewhere"', () => {
    const exports = [{ n: 'A_MODULE_A' }, { n: 'something', ln: 'something' }] as ExportSpecifier[];
    const out = Transformer.createReexportStatement(exports);
    // something should already be re-exported.
    expect(out).toStrictEqual('export { A_MODULE_A };');
  });

  it('should filter out default export', () => {
    const exports = [{ n: 'default' }, { n: 'A_MODULE_A' }] as ExportSpecifier[];
    const out = Transformer.createReexportStatement(exports);
    expect(out).toStrictEqual('export { A_MODULE_A };');
  });

  it('should return an empty string if there are no named exports', () => {
    const exports = [{}, {}, {}] as ExportSpecifier[];
    const out = Transformer.createReexportStatement(exports);
    expect(out).toStrictEqual('');
  });
});
