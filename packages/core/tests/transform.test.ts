import type { ImportSpecifier } from 'es-module-lexer';
import type { ResolveFn } from 'vite';
import { normalizePath, createLogger } from 'vite';
import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'path';
import dedent from 'ts-dedent';

import type { EntryData, FinalPluginOptions, PluginEntries } from '../src/types';
import { importsTargetEntry, requiresTransform, transformImports } from '../src/transform';
import { getTestResolver, MOCKS_FOLDER } from './utils';

const pathToMocks = normalizePath(resolve(__dirname, MOCKS_FOLDER));
const entryA = normalizePath(resolve(pathToMocks, 'entry-a/index.ts'));
const entryAModuleA = normalizePath(resolve(pathToMocks, 'entry-a/modules/A.ts'));
const entryB = normalizePath(resolve(pathToMocks, 'entry-b/index.ts'));
const logger = createLogger();
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
    const options = { ...defaultOptions, ignorePatterns: [/another-project/] } as FinalPluginOptions;

    expect(requiresTransform(id, options)).toStrictEqual(false);
  });

  it('should return false if served file extension is not within config extension list', () => {
    const id = '/path/to/project/file.anotherext';
    const options = defaultOptions;

    expect(requiresTransform(id, options)).toStrictEqual(false);
  });

  it('should return true if served file must be transformed by the plugin', () => {
    const id = '/path/to/project/file.ext';
    const options = defaultOptions;

    expect(requiresTransform(id, options)).toStrictEqual(true);
  });
});

describe('importsTargetEntry', () => {
  const imports = [
    { n: '@mocks/entry-a' },
    { n: undefined },
  ] as ImportSpecifier[];

  it('should return true if any import targets one of the entries using aliases', async () => {
    // should also work with relative paths and bare imports.
    const entries = new Map([[entryA, {} as EntryData]]);
    const result = await importsTargetEntry(entryB, imports, entries, resolver);
    expect(result).toStrictEqual(true);
  });

  it('should return false if none of the imports target one of the entries', async () => {
    const entries = new Map([]) as PluginEntries;
    const result = await importsTargetEntry(entryB, imports, entries, resolver);
    expect(result).toStrictEqual(false);
  });
});

describe('transformImports', () => {
  it('should not transform if it does not import any target entry', async () => {
    const id = '';
    const code = `import { B_MODULE_B, test } from '@mocks/entry-b';`;
    const entryPath = await resolver(resolve(__dirname, MOCKS_FOLDER, 'entry-a')) as string;
    const imports = [{ n: '@mocks/entry-b', ss: 0, se: code.length - 1 }] as any;
    const entries: PluginEntries = new Map([
      [entryPath, {
        exports: new Map([['A_MODULE_A', { path: '', importDefault: true }]]),
        updatedSource: '',
      }],
    ]);

    const transformed = await transformImports(id, code, entries, imports, resolver, logger);
    expect(transformed).toStrictEqual(code);
  });

  it('should transform if it does import at least one target entry', async () => {
    const id = __dirname;
    const code = dedent(`import { A_MODULE_A, test } from '@mocks/entry-a';`);
    const entryPath = await resolver(resolve(__dirname, MOCKS_FOLDER, 'entry-a')) as string;
    const imports = [{ n: '@mocks/entry-a', ss: 0, se: code.length - 1 }] as any;
    const entries: PluginEntries = new Map([
      [entryPath, {
        exports: new Map([['A_MODULE_A', { path: './modules/A', importDefault: true }]]),
        updatedSource: '',
      }],
    ]);

    const transformed = await transformImports(id, code, entries, imports, resolver, logger);
    expect(transformed).toStrictEqual(dedent(`
      import { test } from '${entryPath}';
      import { default as A_MODULE_A } from '${entryAModuleA}';
    `));
  });
});
