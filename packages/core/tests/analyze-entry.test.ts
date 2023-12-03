import fs from 'fs';
import type { ResolveFn } from 'vite';
import { beforeAll, describe, it, expect, vi, beforeEach } from 'vitest';
import dedent from 'ts-dedent';

import type { EntryExports, EntryImports, PluginEntries } from '../src/types';
import EntryAnalyzer from '../src/analyze-entry';
import { getTestResolver, resolveUnitEntry } from './utils';

vi.mock('fs');

let resolver: ResolveFn;

beforeAll(async () => {
  resolver = await getTestResolver();
});

describe('analyzeEntryImport', () => {
  const path = '@any/path';

  const run = (input: string) => {
    const analyzedImports: EntryImports = new Map([]);
    const startPosition = 0;
    const endPosition: number = input.length;
    EntryAnalyzer.analyzeEntryImport(input, analyzedImports, path, startPosition, endPosition);

    return {
      analyzedImports,
      startPosition,
      endPosition,
    };
  };

  describe('aggregated export statements', () => {
    it('should feed the `analyzedImports` map if this is an aggregated export', () => {
      const originalName = 'UserId';
      const output = run(`export { ${originalName} } from '${path}'`);

      expect(output.analyzedImports.size).toStrictEqual(1);
      expect(output.analyzedImports.get('UserId')).toStrictEqual({
        path,
        importDefault: false,
        originalName,
      });
    });

    it('should feed the `analyzedImports` map if this is an aggregated default export with alias', () => {
      const alias = 'User';
      const output = run(`export { default as ${alias} } from '${path}'`);

      expect(output.analyzedImports.size).toStrictEqual(1);
      expect(output.analyzedImports.get(alias)).toStrictEqual({
        path,
        importDefault: true,
      });
    });

    it('should feed the `analyzedImports` map if this is an aggregated export with alias', () => {
      const originalName = 'UserId';
      const alias = 'User';
      const output = run(`export { ${originalName} as ${alias} } from '${path}'`);

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
      const output = run(`import { ${originalName} } from "${path}"`);

      expect(output.analyzedImports.size).toStrictEqual(1);
      expect(output.analyzedImports.get(originalName)).toStrictEqual({
        path,
        importDefault: false,
        originalName,
      });
    });

    it('should feed the `analyzedImports` map if it imports a module', () => {
      const moduleImport = `User`;
      const output = run(`import ${moduleImport} from "${path}"`);

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
      const output = run(`import { ${importString} } from "${path}"`);

      expect(output.analyzedImports.size).toStrictEqual(1);
      expect(output.analyzedImports.get(alias)).toStrictEqual({
        path,
        importDefault: false,
        originalName,
      });
    });

    it('should feed the `analyzedImports` map if it imports a default export with an alias', () => {
      const alias = `MyUser`;
      const output = run(`import { default as ${alias} } from "${path}"`);

      expect(output.analyzedImports.size).toStrictEqual(1);
      expect(output.analyzedImports.get(alias)).toStrictEqual({
        path,
        importDefault: true,
      });
    });
  });
});

describe('analyzeEntryExport', () => {
  it('should correctly feed the `entryMap` when the export relies on a named import statement', () => {
    const path = `@any/path`;
    const importedName = `UserId`;
    const importedParams = { path, importDefault: false };

    const entryMap: EntryExports = new Map([]);
    const analyzedImports = new Map([[importedName, importedParams]]);

    EntryAnalyzer.analyzeEntryExport(entryMap, analyzedImports, importedName);

    expect(entryMap.size).toStrictEqual(1);
    expect(entryMap.get(importedName)).toMatchObject(importedParams);
  });

  it('should correctly feed the `entryMap` when the export relies on a named import statement', () => {
    const path = `@any/path`;
    const importedAlias = 'UserId';
    const originalName = 'UID';
    const importedParams = { path, importDefault: false, originalName };

    const entryMap: EntryExports = new Map([]);
    const analyzedImports = new Map([[importedAlias, importedParams]]);

    EntryAnalyzer.analyzeEntryExport(entryMap, analyzedImports, importedAlias);

    expect(entryMap.size).toStrictEqual(1);
    expect(entryMap.get(importedAlias)).toMatchObject(importedParams);
  });

  it('should correctly feed the `entryMap` when the export relies on a default import statement', () => {
    const path = `@any/path`;
    const importedName = `UserId`;
    const importedParams = { path, importDefault: true };

    const entryMap: EntryExports = new Map([]);
    const analyzedImports = new Map([[importedName, importedParams]]);

    EntryAnalyzer.analyzeEntryExport(entryMap, analyzedImports, importedName);

    expect(entryMap.size).toStrictEqual(1);
    expect(entryMap.get(importedName)).toMatchObject(importedParams);
  });
});

describe('doAnalyzeEntry', () => {
  const run = async (entrySource: string) => {
    const entries: PluginEntries = new Map([]);
    const targetPath = '@entry/path';
    const entryPath = '/path/to/entry';
    vi.mocked(fs.readFileSync).mockReturnValueOnce(entrySource);

    await EntryAnalyzer.doAnalyzeEntry(entries, targetPath);

    return { entries, targetPath, entryPath };
  };

  it('should feed the `entries` map even though it does not export anything', async () => {
    const output = await run(``);
    expect(output.entries.size).toStrictEqual(1);
  });

  it('should feed the `entries` map with simple import/exports', async () => {
    const output = await run(
      dedent(`
      import User from '@models/User';
      import { Group } from '@models/Group';
      import Article from '../models/Article';

      export { Article };
      export { User, Group };
    `),
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
      dedent(`
      export { User, UserId } from '@models/User';
      export { Group } from '../models/Group';
    `),
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
      dedent(`
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
    );
    expect(output.entries.size).toStrictEqual(1);
    expect(output.entries.get(output.targetPath)?.exports.get('User')).toMatchObject({
      path: '@models/User',
      importDefault: false,
    });
    expect(output.entries.get(output.targetPath)?.exports.get('UserName')).toMatchObject({
      path: '@models/User',
      importDefault: false,
    });
    expect(output.entries.get(output.targetPath)?.exports.has('UserId')).toStrictEqual(false);
    expect(output.entries.get(output.targetPath)?.exports.has('Group')).toStrictEqual(false);
    expect(output.entries.get(output.targetPath)?.exports.has('TestValue')).toStrictEqual(false);
    expect(output.entries.get(output.targetPath)?.exports.has('MyGroup')).toStrictEqual(false);
    expect(output.entries.get(output.targetPath)?.exports.has('TestFunction')).toStrictEqual(false);
  });
});

describe('analyzeEntry', () => {
  const path = '@entry/path';

  beforeEach(() => {
    vi.spyOn(EntryAnalyzer, 'doAnalyzeEntry').mockImplementation(() => Promise.resolve());
  });

  it('should directly return void if entry was already parsed', async () => {
    await EntryAnalyzer.analyzeEntry(new Map([[path, {}]]) as any, path);
    expect(EntryAnalyzer.doAnalyzeEntry).not.toHaveBeenCalled();
  });

  it('should call doAnalyzeEntry if entry was not already parsed', async () => {
    await EntryAnalyzer.analyzeEntry(new Map([]), path);
    expect(EntryAnalyzer.doAnalyzeEntry).toHaveBeenCalledWith(expect.anything(), path);
  });

  it('should throw error if anything went wrong while analyzing entry file', async () => {
    vi.spyOn(EntryAnalyzer, 'doAnalyzeEntry').mockImplementationOnce(() => Promise.reject());
    expect(async () => {
      await EntryAnalyzer.analyzeEntry(new Map([]), path);
    }).rejects.toThrowError();
  });
});

describe('analyzeEntries', () => {
  beforeAll(async () => {
    vi.restoreAllMocks();
    const realFs = (await vi.importActual('fs')) as any;
    vi.mocked(fs.readFileSync).mockImplementation(realFs.readFileSync);
  });

  it('should correctly analyze entries', async () => {
    const aPath = await resolveUnitEntry('entry-a');
    const bPath = await resolveUnitEntry('entry-b');
    const entries = await EntryAnalyzer.analyzeEntries([aPath, bPath], resolver);

    expect(entries.size).toStrictEqual(2);
    expect(entries.has(aPath)).toStrictEqual(true);
    expect(entries.has(bPath)).toStrictEqual(true);
  });
});
