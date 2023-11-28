import type { ExportSpecifier, ImportSpecifier } from 'es-module-lexer';
import type { ResolveFn } from 'vite';
import { resolve } from 'path';
import dedent from 'ts-dedent';
import { normalizePath, createLogger } from 'vite';
import { describe, it, expect, beforeAll, vi, beforeEach, afterEach } from 'vitest';

import type { EntryData, FinalPluginOptions, PluginEntries, PluginOptions } from '../src/types';
import Transformer from '../src/transform';
import { getTestResolver, MOCKS_FOLDER_UNIT, STUB_ID, STUB_PATH, STUB_SOURCE } from './utils';
import { Logger } from '../src/logger';

const pathToMocks = normalizePath(resolve(__dirname, MOCKS_FOLDER_UNIT));
const entryA = normalizePath(resolve(pathToMocks, 'entry-a/index.ts'));
const entryAModuleA = normalizePath(resolve(pathToMocks, 'entry-a/modules/A.ts'));
const entryAModuleH = normalizePath(resolve(pathToMocks, 'entry-a/modules/H.ts'));
const entryB = normalizePath(resolve(pathToMocks, 'entry-b/index.ts'));
const entryC = normalizePath(resolve(pathToMocks, 'entry-c/index.ts'));
const logger = new Logger(createLogger(), false);
let resolver: ResolveFn;

beforeAll(async () => {
  resolver = await getTestResolver();
});

describe('requiresTransform', () => {
  const defaultOptions: FinalPluginOptions = {
    extensions: ['ext'],
    ignorePatterns: [/node_modules/],
    debug: false,
    targets: [],
  };

  it('should return false if served file is ignored', () => {
    const id = '/path/to/another-project/file.ext';
    const options = {
      ...defaultOptions,
      ignorePatterns: [/another-project/],
    } as FinalPluginOptions;

    expect(Transformer.requiresTransform(id, options)).toStrictEqual(false);
  });

  it('should return false if served file extension is not within config extension list', () => {
    const id = '/path/to/project/file.anotherext';
    const options = defaultOptions;

    expect(Transformer.requiresTransform(id, options)).toStrictEqual(false);
  });

  it('should return true if served file must be transformed by the plugin', () => {
    const id = '/path/to/project/file.ext';
    const options = defaultOptions;

    expect(Transformer.requiresTransform(id, options)).toStrictEqual(true);
  });
});

describe('importsTargetEntry', () => {
  const imports = [{ n: '@mocks/entry-a' }, { n: undefined }] as ImportSpecifier[];

  it('should return true if any import targets one of the entries using aliases', async () => {
    // should also work with relative paths and bare imports.
    const entries = new Map([[entryA, {} as EntryData]]);
    const result = await Transformer.importsTargetEntry(entryB, imports, entries, resolver);
    expect(result).toStrictEqual(true);
  });

  it('should return false if none of the imports target one of the entries', async () => {
    const entries = new Map([]) as PluginEntries;
    const result = await Transformer.importsTargetEntry(entryB, imports, entries, resolver);
    expect(result).toStrictEqual(false);
  });
});

describe('transformImports', () => {
  it('should not transform if it does not import any target entry', async () => {
    const id = STUB_ID;
    const code = `import { B_MODULE_B, test } from '@mocks/entry-b';`;
    const imps = [{ n: '@mocks/entry-b', ss: 0, se: code.length - 1 }] as ImportSpecifier[];
    const exps = [] as ExportSpecifier[];
    const entries: PluginEntries = new Map([
      [
        entryA,
        {
          exports: new Map([['A_MODULE_A', { path: STUB_PATH, importDefault: true }]]),
          source: STUB_SOURCE,
          updatedSource: STUB_SOURCE,
        },
      ],
    ]);

    const out = await Transformer.transformImports(id, code, entries, imps, exps, resolver, logger);
    expect(out).toStrictEqual(code);
  });

  it('should transform if it does import at least one target entry', async () => {
    const id = __dirname;
    const code = dedent(`import { A_MODULE_A, test } from '@mocks/entry-a';`);
    const imps = [{ n: '@mocks/entry-a', ss: 0, se: code.length - 1 }] as ImportSpecifier[];
    const exps = [] as ExportSpecifier[];
    const entries: PluginEntries = new Map([
      [
        entryA,
        {
          exports: new Map([['A_MODULE_A', { path: './modules/A', importDefault: true }]]),
          source: STUB_SOURCE,
          updatedSource: STUB_SOURCE,
        },
      ],
    ]);

    const out = await Transformer.transformImports(id, code, entries, imps, exps, resolver, logger);
    expect(out).toStrictEqual(
      dedent(`
      import { test } from '${entryA}';
      import { default as A_MODULE_A } from '${entryAModuleA}';
    `),
    );
  });

  it('should transform and re-export if it does import at least one target entry', async () => {
    const id = __dirname;
    const code = dedent(`export { AA, A_MODULE_E } from '@mocks/entry-c';`);
    const imps = [{ n: '@mocks/entry-c', ss: 0, se: code.length - 1 }] as ImportSpecifier[];
    const exps = [{ n: 'AA' }] as ExportSpecifier[];
    const entries: PluginEntries = new Map([
      [
        entryA,
        {
          exports: new Map([
            ['A_MODULE_A', { path: './modules/A', importDefault: true }],
            ['A_MODULE_E', { path: './modules/EF', importDefault: false }],
          ]),
          source: STUB_SOURCE,
          updatedSource: STUB_SOURCE,
        },
      ],
      [
        entryC,
        {
          exports: new Map([['A_MODULE_A', { path: './modules/A', importDefault: true }]]),
          source: STUB_SOURCE,
          updatedSource: STUB_SOURCE,
        },
      ],
    ]);

    const out = await Transformer.transformImports(id, code, entries, imps, exps, resolver, logger);
    expect(out).toStrictEqual(
      dedent(`
      import { test } from '${entryA}';
      import { default as A_MODULE_A } from '${entryAModuleA}';
    `),
    );
  });

  it(
    'should still transform forward if it does import an entity from one target entry' +
      ' which is a re-export of another target entry',
    async () => {
      const id = __dirname;
      const code = dedent(`import { A_MODULE_H } from '@mocks/entry-b';`);
      const imps = [{ n: '@mocks/entry-a', ss: 0, se: code.length - 1 }] as ImportSpecifier[];
      const exps = [] as ExportSpecifier[];
      const entries: PluginEntries = new Map([
        [
          entryA,
          {
            exports: new Map([['A_MODULE_H', { path: './modules/H', importDefault: false }]]),
            source: STUB_SOURCE,
            updatedSource: STUB_SOURCE,
          },
        ],
        [
          entryB,
          {
            exports: new Map([
              ['A_MODULE_H', { path: '../entry-a/modules/H', importDefault: false }],
            ]),
            source: STUB_SOURCE,
            updatedSource: STUB_SOURCE,
          },
        ],
      ]);

      const o = await Transformer.transformImports(id, code, entries, imps, exps, resolver, logger);
      expect(o).toStrictEqual(`import { A_MODULE_H } from '${entryAModuleH}';`);
    },
  );
});

describe('transformImportsIfNeeded', () => {
  beforeEach(() => {
    vi.spyOn(Transformer, 'transformImports').mockImplementationOnce(() => Promise.resolve(''));
    vi.doMock('es-module-lexer', () => ({ parse: vi.fn().mockReturnValue([]) }));
  });

  afterEach(() => {
    vi.doUnmock('es-module-lexer');
  });

  it('should call transformImports when the file is candidate', async () => {
    const res = true;
    vi.spyOn(Transformer, 'importsTargetEntry').mockImplementationOnce(() => Promise.resolve(res));
    await Transformer.transformImportsIfNeeded(STUB_ID, STUB_SOURCE, new Map(), resolver, logger);
    expect(Transformer.transformImports).toHaveBeenCalled();
  });

  it('should not call transformImports when the file is not candidate', async () => {
    const res = false;
    vi.spyOn(Transformer, 'importsTargetEntry').mockImplementationOnce(() => Promise.resolve(res));
    await Transformer.transformImportsIfNeeded(STUB_ID, STUB_SOURCE, new Map(), resolver, logger);
    expect(Transformer.transformImports).not.toHaveBeenCalled();
  });
});

describe('transformIfNeeded', () => {
  const options = {} as unknown as Required<PluginOptions>;

  beforeEach(() => {
    vi.spyOn(Transformer, 'transformImportsIfNeeded').mockImplementationOnce(() =>
      Promise.resolve(''),
    );
  });

  it('should call transformImportsIfNeeded when the file is candidate', async () => {
    const res = true;
    vi.spyOn(Transformer, 'requiresTransform').mockImplementationOnce(() => res);
    await Transformer.transformIfNeeded(STUB_ID, STUB_SOURCE, new Map(), options, resolver, logger);
    expect(Transformer.transformImportsIfNeeded).toHaveBeenCalled();
  });

  it('should not call transformImportsIfNeeded when the file is not candidate', async () => {
    const res = false;
    vi.spyOn(Transformer, 'requiresTransform').mockImplementationOnce(() => res);
    await Transformer.transformIfNeeded(STUB_ID, STUB_SOURCE, new Map(), options, resolver, logger);
    expect(Transformer.transformImportsIfNeeded).not.toHaveBeenCalled();
  });
});

describe('createReexportStatement', () => {
  it('should return valid named re-exports statement', () => {
    const unnamedExport = {};
    const exports = [{ n: 'A_MODULE_A' }, unnamedExport, { n: 'A_MODULE_C' }] as ExportSpecifier[];
    const out = Transformer.createReexportStatement(exports);
    expect(out).toStrictEqual('export { A_MODULE_A,A_MODULE_C };');
  });

  it('should return an empty string if there are no named exports', () => {
    const exports = [{}, {}, {}] as ExportSpecifier[];
    const out = Transformer.createReexportStatement(exports);
    expect(out).toStrictEqual('');
  });
});
