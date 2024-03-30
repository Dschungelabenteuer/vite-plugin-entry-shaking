import fs from 'fs';
import { beforeAll, describe, it, expect, vi, beforeEach } from 'vitest';
import dedent from 'ts-dedent';

import type { Duration, EntryExports, EntryImports, PluginEntries } from '../src/types';
import EntryAnalyzer from '../src/analyze-entry';
import EntryCleaner from '../src/cleanup-entry';
import { createTestContext, createTestWildcardExports, resolveUnitEntry } from './utils';

vi.mock('fs');

const mockedDuration: Duration = [0, 0];

describe.each([true, false])('with or without new line characters', (newLineChar) => {
  const createStatementVariant = (srcString: string) =>
    newLineChar ? srcString.replaceAll(' ', '\n') : srcString;

  describe('analyzeEntries', () => {
    beforeAll(async () => {
      vi.restoreAllMocks();
      const realFs = (await vi.importActual('fs')) as any;
      vi.mocked(fs.readFileSync).mockImplementation(realFs.readFileSync);
    });

    it('should correctly analyze entries', async () => {
      const aPath = await resolveUnitEntry('entry-a');
      const bPath = await resolveUnitEntry('entry-b');
      const targets = [aPath, bPath];
      const ctx = await createTestContext({ targets });
      ctx.entries = await EntryAnalyzer.analyzeEntries(ctx);

      expect(ctx.entries.size).toStrictEqual(2);
      expect(ctx.entries.has(aPath)).toStrictEqual(true);
      expect(ctx.entries.has(bPath)).toStrictEqual(true);
    });
  });

  describe('analyzeEntry', () => {
    const path = '@entry/path';

    beforeEach(() => {
      vi.restoreAllMocks();
      vi.spyOn(EntryAnalyzer, 'doAnalyzeEntry').mockImplementation(async () =>
        Promise.resolve(mockedDuration),
      );
    });

    it('should directly return void if entry was already parsed', async () => {
      const ctx = await createTestContext({ targets: [path] });
      ctx.entries = new Map([[path, {}]]) as any;
      await EntryAnalyzer.analyzeEntry(ctx, path, 0);
      expect(EntryAnalyzer.doAnalyzeEntry).not.toHaveBeenCalled();
    });

    it('should call doAnalyzeEntry if entry was not already parsed', async () => {
      const ctx = await createTestContext({ targets: [path] });
      ctx.entries = new Map([]) as any;
      await EntryAnalyzer.analyzeEntry(ctx, path, 0);
      expect(EntryAnalyzer.doAnalyzeEntry).toHaveBeenCalledWith(ctx, path, 0);
    });

    it('should throw error if anything went wrong while analyzing entry file', async () => {
      const ctx = await createTestContext({ targets: [path] });
      ctx.entries = new Map([]) as any;
      vi.spyOn(EntryAnalyzer, 'doAnalyzeEntry').mockImplementationOnce(() => Promise.reject());
      expect(async () => {
        await EntryAnalyzer.analyzeEntry(ctx, path, 0);
      }).rejects.toThrowError();
    });
  });

  describe('doAnalyzeEntry', () => {
    beforeAll(() => {
      vi.restoreAllMocks();
    });

    const run = async (entrySource: string) => {
      const entries: PluginEntries = new Map([]);
      const targetPath = '@entry/path';
      const entryPath = '/path/to/entry';
      const ctx = await createTestContext({ targets: [targetPath] });
      ctx.entries = entries;
      vi.mocked(fs.readFileSync).mockReturnValueOnce(entrySource);

      await EntryAnalyzer.doAnalyzeEntry(ctx, targetPath, 0);

      return { entries, targetPath, entryPath };
    };

    it('should feed the `entries` map even though it does not export anything', async () => {
      const output = await run(``);
      expect(output.entries.size).toStrictEqual(1);
    });

    it('should feed the `entries` map with simple import/exports', async () => {
      const output = await run(
        dedent(
          createStatementVariant(`
        import User from '@models/User';
        import { Group } from '@models/Group';
        import Article from '../models/Article';

        export { Article };
        export { User, Group };
      `),
        ),
      );
      expect(output.entries.size).toStrictEqual(1);
      expect(output.entries.get(output.targetPath)?.exports.get('User')).toMatchObject({
        path: '@models/User',
        importDefault: true,
      });
      expect(output.entries.get(output.targetPath)?.exports.get('Group')).toMatchObject({
        path: '@models/Group',
        importDefault: false,
      });
      expect(output.entries.get(output.targetPath)?.exports.get('Article')).toMatchObject({
        path: '../models/Article',
        importDefault: true,
      });
    });

    it('should feed the `entries` map with renamed import/exports', async () => {
      const output = await run(
        dedent(`
        import { User as MyUser } from '@models/User';

        export { MyUser };
      `),
      );
      expect(output.entries.size).toStrictEqual(1);
      expect(output.entries.get(output.targetPath)?.exports.has('User')).toStrictEqual(false);
    });

    it('should feed the `entries` map with aggregated exports', async () => {
      const output = await run(
        dedent(
          createStatementVariant(`
        export { User, UserId } from '@models/User';
        export { Group } from '../models/Group';
      `),
        ),
      );
      expect(output.entries.size).toStrictEqual(1);
      expect(output.entries.get(output.targetPath)?.exports.get('UserId')).toMatchObject({
        path: '@models/User',
        importDefault: false,
      });
      expect(output.entries.get(output.targetPath)?.exports.get('User')).toMatchObject({
        path: '@models/User',
        importDefault: false,
      });
      expect(output.entries.get(output.targetPath)?.exports.get('Group')).toMatchObject({
        path: '../models/Group',
        importDefault: false,
      });
    });

    it('should ignore exports which are not direct re-exports of imports', async () => {
      const output = await run(
        dedent(
          createStatementVariant(`
        import { User, UserName, UserId } from '@models/User';
        import Group from '../models/Group';
        export { User, UserName };
        export { Test } from '../models/Test';
        export let TestValue = 'value';
        export const MyGroup = Group;
        export function TestFunction() {
          return User;
        };
      `),
        ),
      );
      const resolvedEntry = output.entries.get(output.targetPath);

      expect(output.entries.size).toStrictEqual(1);
      expect(resolvedEntry?.exports.get('User')).toMatchObject({
        path: '@models/User',
        importDefault: false,
      });
      expect(resolvedEntry?.exports.get('UserName')).toMatchObject({
        path: '@models/User',
        importDefault: false,
      });

      expect(resolvedEntry?.exports.has('UserId')).toStrictEqual(false);
      expect(resolvedEntry?.exports.has('Group')).toStrictEqual(false);
      expect(resolvedEntry?.exports.get('TestValue')?.selfDefined).toStrictEqual(true);
      expect(resolvedEntry?.exports.get('MyGroup')?.selfDefined).toStrictEqual(true);
      expect(resolvedEntry?.exports.get('TestFunction')?.selfDefined).toStrictEqual(true);
    });
  });

  describe('cleanupEntry', () => {
    const entryPath = '@entry/path';
    const code = 'code content';
    const withImport = 'import { Something } from "somewhere"; export const a = "my" + Something';
    const withoutImport = 'export const a = `my thing`';

    it('should call entry cleaner', async () => {
      const ctx = await createTestContext({
        targets: [],
        diagnostics: { definedWithinEntry: true },
      });
      vi.spyOn(EntryCleaner, 'cleanupEntry');
      EntryAnalyzer.cleanupEntry(ctx, new Set(), entryPath, code, new Map(), [], true);
      expect(EntryCleaner.cleanupEntry).toHaveBeenCalled();
    });

    it('should not add diagnostic if `diagnostics.definedWithinEntry` is set to `false`', async () => {
      const ctx = await createTestContext({
        targets: [],
        diagnostics: { definedWithinEntry: false },
      });
      vi.spyOn(EntryCleaner, 'cleanupEntry').mockImplementationOnce(() => withImport);
      EntryAnalyzer.cleanupEntry(ctx, new Set(), entryPath, code, new Map(), [], true);
      expect(ctx.diagnostics.list.length).toStrictEqual(0);
    });

    it('should not add diagnostic if `diagnostics.definedWithinEntry` is set to `true` but does not define exported code', async () => {
      const ctx = await createTestContext({
        targets: [],
        diagnostics: { definedWithinEntry: true },
      });
      vi.spyOn(EntryCleaner, 'cleanupEntry').mockImplementationOnce(() => withImport);
      EntryAnalyzer.cleanupEntry(ctx, new Set(), entryPath, code, new Map(), [], false);
      expect(ctx.diagnostics.list.length).toStrictEqual(0);
    });

    it('should not add diagnostic if `diagnostics.definedWithinEntry` is set to `true` but does not include any import', async () => {
      const ctx = await createTestContext({
        targets: [],
        diagnostics: { definedWithinEntry: true },
      });
      vi.spyOn(EntryCleaner, 'cleanupEntry').mockImplementationOnce(() => withoutImport);
      EntryAnalyzer.cleanupEntry(ctx, new Set(), entryPath, code, new Map(), [], true);
      expect(ctx.diagnostics.list.length).toStrictEqual(0);
    });

    it('should add diagnostic if `diagnostics.definedWithinEntry` is set to `true` and requirements are met', async () => {
      const ctx = await createTestContext({
        targets: [],
        diagnostics: { definedWithinEntry: true },
      });
      vi.spyOn(EntryCleaner, 'cleanupEntry').mockImplementationOnce(() => withImport);
      EntryAnalyzer.cleanupEntry(ctx, new Set(), entryPath, code, new Map(), [], true);
      expect(ctx.diagnostics.list.length).toStrictEqual(1);
    });
  });

  describe('analyzeEntryImport', async () => {
    const path = '@any/path';
    const entryPath = '/path/to/entry';
    const ctx = await createTestContext({ targets: [entryPath] });
    const wildcardImports = createTestWildcardExports();

    beforeAll(() => {
      vi.restoreAllMocks();
    });

    const run = (input: string) => {
      const analyzedImports: EntryImports = new Map([]);
      const startPosition = 0;
      const endPosition: number = input.length;
      EntryAnalyzer.analyzeEntryImport(
        ctx,
        input,
        new Set(),
        wildcardImports,
        analyzedImports,
        entryPath,
        path,
        startPosition,
        endPosition,
        0,
      );

      return {
        analyzedImports,
        startPosition,
        endPosition,
      };
    };

    describe('aggregated export statements', () => {
      it('should feed the `analyzedImports` map if this is an aggregated export', () => {
        const originalName = 'UserId';
        const output = run(createStatementVariant(`export { ${originalName} } from '${path}'`));

        expect(output.analyzedImports.size).toStrictEqual(1);
        expect(output.analyzedImports.get('UserId')).toStrictEqual({
          path,
          importDefault: false,
          originalName,
        });
      });

      it('should feed the `analyzedImports` map if this is an aggregated default export with alias', () => {
        const alias = 'User';
        const output = run(createStatementVariant(`export { default as ${alias} } from '${path}'`));

        expect(output.analyzedImports.size).toStrictEqual(1);
        expect(output.analyzedImports.get(alias)).toStrictEqual({
          path,
          importDefault: true,
        });
      });

      it('should feed the `analyzedImports` map if this is an aggregated export with alias', () => {
        const originalName = 'UserId';
        const alias = 'User';
        const output = run(
          createStatementVariant(`export { ${originalName} as ${alias} } from '${path}'`),
        );

        expect(output.analyzedImports.size).toStrictEqual(1);
        expect(output.analyzedImports.get(alias)).toStrictEqual({
          path,
          importDefault: false,
          originalName,
        });
      });
    });

    describe('import statements', () => {
      it('should feed the `analyzedImports` map if it imports named exports', () => {
        const originalName = `GroupId`;
        const output = run(createStatementVariant(`import { ${originalName} } from "${path}"`));

        expect(output.analyzedImports.size).toStrictEqual(1);
        expect(output.analyzedImports.get(originalName)).toStrictEqual({
          path,
          importDefault: false,
          originalName,
        });
      });

      it('should feed the `analyzedImports` map if it imports a module', () => {
        const moduleImport = `User`;
        const output = run(createStatementVariant(`import ${moduleImport} from "${path}"`));

        expect(output.analyzedImports.size).toStrictEqual(1);
        expect(output.analyzedImports.get(moduleImport)).toStrictEqual({
          path,
          importDefault: true,
        });
      });

      it('should feed the `analyzedImports` map if it imports a named export with an alias', () => {
        const originalName = `User`;
        const alias = `MyUser`;
        const importString = `${originalName} as ${alias}`;
        const output = run(createStatementVariant(`import { ${importString} } from "${path}"`));

        expect(output.analyzedImports.size).toStrictEqual(1);
        expect(output.analyzedImports.get(alias)).toStrictEqual({
          path,
          importDefault: false,
          originalName,
        });
      });

      it('should feed the `analyzedImports` map if it imports a default export with an alias', () => {
        const alias = `MyUser`;
        const output = run(createStatementVariant(`import { default as ${alias} } from "${path}"`));

        expect(output.analyzedImports.size).toStrictEqual(1);
        expect(output.analyzedImports.get(alias)).toStrictEqual({
          path,
          importDefault: true,
        });
      });
    });

    describe('wildcard export', () => {
      it('should not feed the `analyzedImports` map ', () => {
        const output = run(`export * from "${path}"`);
        expect(output.analyzedImports.size).toStrictEqual(0);
      });

      it('should not call `registerWildcardImportIfNeeded`', () => {
        vi.spyOn(EntryAnalyzer, 'registerWildcardImportIfNeeded');
        run(`export * from "${path}"`);
        expect(EntryAnalyzer.registerWildcardImportIfNeeded).toHaveBeenCalledWith(
          ctx,
          expect.any(Set),
          path,
          entryPath,
          0,
        );
      });
    });

    describe('wildcard import', () => {
      it('should not feed the `analyzedImports` map ', () => {
        const output = run(`import * from "${path}"`);
        expect(output.analyzedImports.size).toStrictEqual(0);
      });

      it('should not call `registerWildcardImportIfNeeded`', () => {
        vi.spyOn(EntryAnalyzer, 'registerWildcardImportIfNeeded');
        run(`import * from "${path}"`);
        expect(EntryAnalyzer.registerWildcardImportIfNeeded).toHaveBeenCalledWith(
          ctx,
          expect.any(Set),
          path,
          entryPath,
          0,
        );
      });
    });
  });

  describe('analyzeEntryExport', () => {
    const entryPath = '@mocks/entry-a';

    beforeAll(() => {
      vi.restoreAllMocks();
    });

    it('should correctly feed the `entryMap` when the export relies on a named import statement', () => {
      const path = `@any/path`;
      const importedName = `UserId`;
      const importedParams = { path, importDefault: false };
      const wildcardImports = createTestWildcardExports();

      const entryMap: EntryExports = new Map([]);
      const analyzedImports = new Map([[importedName, importedParams]]);

      EntryAnalyzer.analyzeEntryExport(
        entryPath,
        entryMap,
        wildcardImports,
        analyzedImports,
        importedName,
      );

      expect(entryMap.size).toStrictEqual(1);
      expect(entryMap.get(importedName)).toMatchObject(importedParams);
    });

    it('should correctly feed the `entryMap` when the export relies on a named import statement', () => {
      const path = `@any/path`;
      const importedAlias = 'UserId';
      const originalName = 'UID';
      const importedParams = { path, importDefault: false, originalName };
      const wildcardImports = createTestWildcardExports();

      const entryMap: EntryExports = new Map([]);
      const analyzedImports = new Map([[importedAlias, importedParams]]);

      EntryAnalyzer.analyzeEntryExport(
        entryPath,
        entryMap,
        wildcardImports,
        analyzedImports,
        importedAlias,
      );

      expect(entryMap.size).toStrictEqual(1);
      expect(entryMap.get(importedAlias)).toMatchObject(importedParams);
    });

    it('should correctly feed the `entryMap` when the export relies on a default import statement', () => {
      const path = `@any/path`;
      const importedName = `UserId`;
      const importedParams = { path, importDefault: true };
      const wildcardImports = createTestWildcardExports();

      const entryMap: EntryExports = new Map([]);
      const analyzedImports = new Map([[importedName, importedParams]]);

      EntryAnalyzer.analyzeEntryExport(
        entryPath,
        entryMap,
        wildcardImports,
        analyzedImports,
        importedName,
      );

      expect(entryMap.size).toStrictEqual(1);
      expect(entryMap.get(importedName)).toMatchObject(importedParams);
    });
  });

  describe('registerWildcardImportIfNeeded', () => {
    beforeAll(() => {
      vi.restoreAllMocks();
    });

    beforeEach(() => {
      vi.spyOn(EntryAnalyzer, 'registerWildcardImport');
    });

    describe('if wildcard-imported is another target entry', () => {
      const entryOnePath = '/path/to/entry';
      const otherTargetEntryPath = '/path/to/other';

      it('should call `registerWildcardImport` even if `maxWildcardDepth` was not set', async () => {
        const ctx = await createTestContext({ targets: [entryOnePath, otherTargetEntryPath] });
        EntryAnalyzer.registerWildcardImportIfNeeded(
          ctx,
          new Set(),
          otherTargetEntryPath,
          entryOnePath,
          0,
        );
        expect(EntryAnalyzer.registerWildcardImport).toHaveBeenCalledOnce();
        expect(EntryAnalyzer.registerWildcardImport).toHaveBeenCalledWith(
          ctx,
          otherTargetEntryPath,
          entryOnePath,
          1,
        );
      });

      it('should call `registerWildcardImport` even if `maxWildcardDepth` was reached', async () => {
        const targets = [entryOnePath, otherTargetEntryPath];
        const ctx = await createTestContext({ targets, maxWildcardDepth: 2 });
        EntryAnalyzer.registerWildcardImportIfNeeded(
          ctx,
          new Set(),
          otherTargetEntryPath,
          entryOnePath,
          3,
        );
        expect(EntryAnalyzer.registerWildcardImport).toHaveBeenCalledOnce();
        expect(EntryAnalyzer.registerWildcardImport).toHaveBeenCalledWith(
          ctx,
          otherTargetEntryPath,
          entryOnePath,
          4,
        );
      });

      it('should not add diagnostic if `maxWildcardDepth` was reached and `diagnostics.maxDepthReached` is set to `false`', async () => {
        const targets = [entryOnePath];
        const ctx = await createTestContext({
          targets,
          maxWildcardDepth: 2,
          diagnostics: { maxDepthReached: false },
        });
        const diagnostics = new Set<number>();
        EntryAnalyzer.registerWildcardImportIfNeeded(
          ctx,
          diagnostics,
          otherTargetEntryPath,
          entryOnePath,
          3,
        );
        expect(diagnostics.size).toStrictEqual(0);
      });

      it('should add diagnostic if `maxWildcardDepth` was reached and `diagnostics.maxDepthReached` is set to `true`', async () => {
        const targets = [entryOnePath];
        const ctx = await createTestContext({
          targets,
          maxWildcardDepth: 2,
          diagnostics: { maxDepthReached: true },
        });
        const diagnostics = new Set<number>();
        EntryAnalyzer.registerWildcardImportIfNeeded(
          ctx,
          diagnostics,
          otherTargetEntryPath,
          entryOnePath,
          3,
        );
        expect(diagnostics.size).toStrictEqual(1);
      });
    });

    describe('if wildcard-imported is not another target entry', () => {
      const entryOnePath = '/path/to/entry';
      const wildcardExportedPath = '/path/to/wildcard';

      it('should not call `registerWildcardImport` if `maxWildcardDepth` was not set', async () => {
        const ctx = await createTestContext({ targets: [entryOnePath] });
        EntryAnalyzer.registerWildcardImportIfNeeded(
          ctx,
          new Set(),
          wildcardExportedPath,
          entryOnePath,
          0,
        );
        expect(EntryAnalyzer.registerWildcardImport).not.toHaveBeenCalled();
      });

      it('should not call `registerWildcardImport` if `maxWildcardDepth` was reached', async () => {
        const ctx = await createTestContext({ targets: [entryOnePath], maxWildcardDepth: 2 });
        EntryAnalyzer.registerWildcardImportIfNeeded(
          ctx,
          new Set(),
          wildcardExportedPath,
          entryOnePath,
          3,
        );
        expect(EntryAnalyzer.registerWildcardImport).not.toHaveBeenCalled();
      });

      it('should call `registerWildcardImport` if `maxWildcardDepth` was not reached', async () => {
        const ctx = await createTestContext({ targets: [entryOnePath], maxWildcardDepth: 2 });
        EntryAnalyzer.registerWildcardImportIfNeeded(
          ctx,
          new Set(),
          wildcardExportedPath,
          entryOnePath,
          1,
        );
        expect(EntryAnalyzer.registerWildcardImport).toHaveBeenCalledOnce();
        expect(EntryAnalyzer.registerWildcardImport).toHaveBeenCalledWith(
          ctx,
          wildcardExportedPath,
          entryOnePath,
          2,
        );
      });
    });
  });

  describe('registerWildcardImport', () => {
    beforeAll(async () => {
      vi.restoreAllMocks();
      const realFs = (await vi.importActual('fs')) as any;
      vi.mocked(fs.readFileSync).mockImplementation(realFs.readFileSync);
    });

    it('should not register wildcard-imported module as a target if it could not be resolved', async () => {
      vi.spyOn(EntryAnalyzer, 'analyzeEntry');
      const aPath = await resolveUnitEntry('entry-a');
      const ctx = await createTestContext({ targets: [aPath], maxWildcardDepth: 2 });

      await EntryAnalyzer.registerWildcardImport(ctx, '/path/to/the-void', aPath, 0);

      expect(ctx.targets.size).toStrictEqual(1);
      expect(EntryAnalyzer.analyzeEntry).not.toHaveBeenCalled();
    });

    it('should not register wildcard-imported module as a target if it is already a target', async () => {
      vi.spyOn(EntryAnalyzer, 'analyzeEntry');
      const aPath = await resolveUnitEntry('entry-a');
      const bPath = await resolveUnitEntry('entry-b');
      const ctx = await createTestContext({ targets: [aPath, bPath], maxWildcardDepth: 2 });

      await EntryAnalyzer.registerWildcardImport(ctx, bPath, aPath, 0);

      expect(ctx.targets.size).toStrictEqual(2);
      expect(EntryAnalyzer.analyzeEntry).not.toHaveBeenCalled();
    });

    it('should register wildcard-imported module as a target if it is NOT already a target', async () => {
      vi.spyOn(EntryAnalyzer, 'analyzeEntry');
      const aPath = await resolveUnitEntry('entry-a');
      const t = await resolveUnitEntry('entry-a/modules/A');
      const ctx = await createTestContext({ targets: [aPath], maxWildcardDepth: 2 });

      await EntryAnalyzer.registerWildcardImport(ctx, './modules/A', aPath, 0);

      expect(ctx.targets.size).toStrictEqual(2);
      expect(EntryAnalyzer.analyzeEntry).toHaveBeenCalledWith(ctx, t, 0);
    });
  });
});
