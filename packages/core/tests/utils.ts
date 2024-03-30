import type { ResolvedConfig } from 'vite';
import { resolve } from 'path';
import { resolveConfig, createLogger } from 'vite';
import { init, parse } from 'es-module-lexer';
import { expect, vi } from 'vitest';
import dedent from 'ts-dedent';

import type { EntryData, PluginOptions, WildcardExports } from '../src/types';
import type { Parallel } from '../src/utils';
import EntryAnalyzer from '../src/analyze-entry';
import { extensions, mergeOptions } from '../src/options';
import { transformIfNeeded } from '../src/transform';
import { Context } from '../src/context';
import utils from '../src/utils';

/** Case structure. */
export type Case = {
  /** Input string. */
  input: string;
  /** List of targets' paths. */
  targetsPaths: string;
};

/** Case target structure. */
export type CaseTarget = {
  /** Path to target. */
  path: string;
  /** Expected number of imports remaining in the target (see limitations). */
  expectedImportRemainsCount?: number;
};

/** Vite resolver for tests. */
let testResolver: Awaited<ReturnType<typeof getTestResolver>>;

/** Mock folder name. */
export const MOCKS_FOLDER = '__mocks__';
/** Path to unit mocks (from core package). */
export const MOCKS_FOLDER_UNIT = '__mocks__/unit';
/** Base filename tests rely on (it should include a supported extension). */
export const MOCK_MAIN_FILE = 'main.ts';
/** Mock import input. */
export const MOCK_IMPORT_INPUT = {
  path: 'some path',
  importDefault: false,
  originalName: 'some name',
  name: 'some name',
};

/** Stub for the content of a source file. */
export const STUB_SOURCE = '';
/** Stub for the content of a path. */
export const STUB_PATH = '';
/** Stub for the content of an id. */
export const STUB_ID = '';
/** Stub for an empty analyzed entry data. */
export const STUB_EMPTY_ENTRY_DATA: EntryData = {
  exports: new Map(),
  diagnostics: new Set(),
  hits: 0,
  time: 0,
  self: 0,
  importsCount: 0,
  source: STUB_SOURCE,
  updatedSource: STUB_SOURCE,
  depth: 0,
};

/** Stub for Vite's configuration.. */
export const VITE_CONFIG = {
  resolve: {
    alias: {
      '@test-cases': resolve(__dirname, 'cases'),
      '@test-modules': resolve(__dirname, MOCKS_FOLDER, 'modules'),
      '@mocks/entry-a': resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-a'),
      '@mocks/entry-b': resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-b'),
      '@mocks/entry-c': resolve(__dirname, MOCKS_FOLDER_UNIT, 'entry-c'),
    },
  },
};

export const COMMON_EXPECTATION = 'Also should not import target, and correctly transform target';
export const DUPE_EXPORT_EXPECTATION = 'should also work when using a dupe export';
export const ALIAS_IMPORT_EXPECTATION = 'should also work when using an alias import';

/** Target remains (this should be the only remaining content in targets). */
export const targetRemains = dedent(`
  /** Below content should not be removed from the transformed target. */
  import "@test-modules/sideffect-module";
  import { ConsumedExport } from '@test-modules/consumed-export';
  export const ExportDefinedFromTarget = 'ExportDefinedFromTarget';
  const CodeDefinedFromTarget = \`CodeDefinedFromTarget: \${ConsumedExport}\`;
  console.info('This is being printed from target, which means target was requested', CodeDefinedFromTarget);
`);

/**
 * This transforms the original `parallelize` implementation so
 * that execution is… well… not parallel anymore. This ensures
 * consistent ordering when testing against hard-coded inputs. */
const sequentialize: Parallel = async (items, callback) => {
  for (const [i, v] of items.entries()) {
    await callback(v, i, items);
  }
};

/** Creates a test path resolver. */
export const getTestResolver = async () =>
  (await resolveConfig(VITE_CONFIG, 'serve')).createResolver();

/** Returns the updated target content. */
export const getCaseTarget = (res: Awaited<ReturnType<typeof runCase>>, target: string) =>
  res.entries?.get(target)?.updatedSource.trim();

/** Prepares some target case data. */
export const setupCase = (target: CaseTarget, middleTarget?: CaseTarget) => ({
  importPath: (middleTarget ?? target).path,
  targetList: [target, ...(middleTarget ? [middleTarget] : [])],
});

/**
 * This function mimics the plugin's logic based on the `tests/cases` folder.
 * @param main File/module content, as it would be processed by Vite's transform hook.
 * @param options Plugin options.
 */
export async function runCase(main: string, options: PluginOptions) {
  const finalOptions: Required<PluginOptions> = {
    ...options,
    diagnostics: options.diagnostics ?? false,
    maxWildcardDepth: options.maxWildcardDepth ?? 0,
    ignorePatterns: options.ignorePatterns ?? [],
    debug: false,
    extensions,
  };

  const context = await createTestContext(finalOptions);
  const entries = await EntryAnalyzer.analyzeEntries(context);
  const transformed = await transformIfNeeded(context, MOCK_MAIN_FILE, main);
  return { entries, transformed };
}

/**
 * Test utility that runs a case and checks if:
 * - the input content was transformed correctly.
 * - targets were transformed correctly.
 * @param targets Resolved paths to targets.
 * @param input  Input content.
 * @param output Expected output content.
 * @param options Plugin options.
 */
export async function testCase(
  targets: CaseTarget[],
  input: string,
  output: string,
  options?: Partial<PluginOptions>,
) {
  if (!targets.length) throw new Error('Case target is undefined');

  vi.spyOn(utils, 'parallelize').mockImplementation(sequentialize);

  await init;
  const targetPaths = targets.map(({ path }) => path);
  const res = await runCase(input, { ...(options ?? {}), targets: targetPaths });
  const remainsLength = targetRemains.split('\n').length;

  // It should have direct import and not import target.
  expect(res.transformed).toStrictEqual(output);

  targets.forEach(({ path, expectedImportRemainsCount }) => {
    const targetContent = getCaseTarget(res, path);
    const lines = targetContent!.split('\n');

    if (expectedImportRemainsCount !== undefined) {
      // Imports should be kept in entry in case they are used by defining code.
      // Let's count them (but ignore both imports used in targetRemains).
      const [imports] = parse(targetContent!);
      expect(imports.length - 2).toStrictEqual(expectedImportRemainsCount);

      // Target should only contain code it defines.
      const targetContentEnd = lines.slice(remainsLength * -1).join('\n');
      expect(targetContentEnd).toStrictEqual(targetRemains);
    }
  });
}

/**
 * Creates a test context.
 * @param options Plugin options.
 */
export async function createTestContext(options: PluginOptions) {
  const resolver = await getTestResolver();

  const config = {
    createResolver: () => resolver,
    logger: createLogger(),
  } as ResolvedConfig;

  const finalOptions = mergeOptions(options);
  const context = new Context(finalOptions, config);
  await context['registerTargets']();
  return context;
}

/**
 * Creates a test wildcard exports structure.
 */
export function createTestWildcardExports(
  named?: WildcardExports['named'],
  direct?: WildcardExports['direct'],
) {
  return {
    named: named ?? new Map(),
    direct: direct ?? [],
  };
}

/**
 * Creates a simple entry data object, with the ability
 * to pass an exports map.
 * @param exports List of exports.
 */
export function createMockEntryData(exports: EntryData['exports'] = new Map()): EntryData {
  return {
    exports,
    hits: 0,
    time: 0,
    self: 0,
    importsCount: 0,
    diagnostics: new Set(),
    source: STUB_SOURCE,
    updatedSource: STUB_SOURCE,
    depth: 0,
  };
}

/**
 * Creates a simple case target.
 * @param origin Path to target.
 * @param expectedImportRemainsCount Expected number of imports remaining in the target (see limitations).
 */
export async function createCaseTarget(
  origin: string,
  expectedImportRemainsCount?: number,
): Promise<CaseTarget> {
  const path = await resolvePath(origin);
  if (!path) throw new Error(`Could not resolve mock entry "${origin}"`);
  return { path, expectedImportRemainsCount };
}

/**
 * This resolves the path to one of mock entries from 'unit' folder.
 * @param name Name of the entry (will match `${name}.ts` or `${name}/index.ts`).
 */
export async function resolveUnitEntry(name: string) {
  const resolver = await getResolver();
  const entryPath = resolve(__dirname, MOCKS_FOLDER_UNIT, name);
  const path = await resolver(entryPath);
  if (!path) throw new Error(`Could not resolve mock entry "${name}"`);
  return path;
}

/**
 * This returns a Vite resolver used in tests.
 * It creates it if it doesn't exist yet.
 */
async function getResolver() {
  if (!testResolver) testResolver = await getTestResolver();
  return testResolver;
}

/**
 * This returns the absolute path from a path (which could use aliases).
 * @param path Path to resolve.
 */
export async function resolvePath(path: string) {
  const resolver = await getResolver();
  return await resolver(path);
}

/**
 * This returns the absolute path of a test module.
 * @param relPath Relative path to the module (from `__mocks__/modules`).
 */
export async function resolveModule(relPath: string) {
  const resolver = await getResolver();
  return await resolver(`@test-modules/${relPath}`);
}
