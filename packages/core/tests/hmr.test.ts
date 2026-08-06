import type { ModuleGraph, ModuleNode } from 'vite';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EntryAnalyzer from '../src/analyze-entry';
import { addSourceQuerySuffix } from '../src/urls';
import { createMockEntryData, createTestContext } from './utils';

const createModule = (id: string, file = id.split('?')[0]) =>
  ({
    id,
    file,
    url: id,
  }) as ModuleNode;

describe('HMR', () => {
  const entryId = '/path/to/entry.ts';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should re-analyze entry updates and report whether the changed file is an entry', async () => {
    const ctx = await createTestContext({ targets: [] });
    ctx.entries = new Map([[entryId, createMockEntryData()]]);
    vi.spyOn(EntryAnalyzer, 'doAnalyzeEntry').mockResolvedValue([0, 0]);

    await expect(ctx.hmr.checkUpdate(addSourceQuerySuffix(entryId))).resolves.toStrictEqual(true);
    expect(EntryAnalyzer.doAnalyzeEntry).toHaveBeenCalledWith(ctx, entryId, 0);

    await expect(ctx.hmr.checkUpdate('/path/to/other.ts')).resolves.toStrictEqual(false);
    expect(EntryAnalyzer.doAnalyzeEntry).toHaveBeenCalledTimes(1);
  });

  it('should return normal and source served ids for entry updates only', async () => {
    const ctx = await createTestContext({ targets: [] });
    ctx.entries = new Map([[entryId, createMockEntryData()]]);

    expect(ctx.hmr.getHotUpdateModuleIds(entryId)).toStrictEqual([
      entryId,
      addSourceQuerySuffix(entryId),
    ]);
    expect(ctx.hmr.getHotUpdateModuleIds('/path/to/other.ts')).toStrictEqual([]);
  });

  it('should collect entry modules and plugin source variants from Vite module graph', async () => {
    const ctx = await createTestContext({ targets: [] });
    const sourceId = addSourceQuerySuffix(entryId);
    const normalModule = createModule(entryId);
    const sourceModule = createModule(sourceId, entryId);
    const unrelatedQueryModule = createModule(`${entryId}?raw`, entryId);
    const unrelatedModule = createModule('/path/to/other.ts');
    const modulesById = new Map([
      [entryId, normalModule],
      [sourceId, sourceModule],
      [unrelatedQueryModule.id, unrelatedQueryModule],
    ]);
    const moduleGraph = {
      getModuleById: vi.fn((id: string) => modulesById.get(id)),
      getModulesByFile: vi.fn(() => new Set([sourceModule, unrelatedQueryModule])),
    } as Pick<ModuleGraph, 'getModuleById' | 'getModulesByFile'>;

    ctx.entries = new Map([[entryId, createMockEntryData()]]);

    const modules = ctx.hmr.getHotUpdateModules(
      entryId,
      [normalModule, unrelatedModule],
      moduleGraph,
    );

    expect(new Set(modules)).toStrictEqual(new Set([normalModule, sourceModule]));
    expect(moduleGraph.getModulesByFile).toHaveBeenCalledWith(entryId);
    expect(moduleGraph.getModuleById).toHaveBeenCalledWith(entryId);
    expect(moduleGraph.getModuleById).toHaveBeenCalledWith(sourceId);
  });

  it('should collect transformed importers that depended on the changed entry analysis', async () => {
    const ctx = await createTestContext({ targets: [] });
    const importerId = '/path/to/consumer.ts';
    const normalModule = createModule(entryId);
    const importerModule = createModule(importerId);
    const modulesById = new Map([
      [entryId, normalModule],
      [importerId, importerModule],
    ]);
    const moduleGraph = {
      getModuleById: vi.fn((id: string) => modulesById.get(id)),
      getModulesByFile: vi.fn(() => new Set<ModuleNode>()),
    } as Pick<ModuleGraph, 'getModuleById' | 'getModulesByFile'>;

    ctx.entries = new Map([[entryId, createMockEntryData()]]);
    ctx.hmr.registerEntryImporter(importerId, [entryId]);

    const modules = ctx.hmr.getHotUpdateModules(entryId, [normalModule], moduleGraph);

    expect(new Set(modules)).toStrictEqual(new Set([normalModule, importerModule]));
    expect(moduleGraph.getModuleById).toHaveBeenCalledWith(importerId);
  });

  it('should remove stale transformed importer references before registering new ones', async () => {
    const ctx = await createTestContext({ targets: [] });
    const importerId = '/path/to/consumer.ts';
    const otherEntryId = '/path/to/other-entry.ts';
    ctx.entries = new Map([
      [entryId, createMockEntryData()],
      [otherEntryId, createMockEntryData()],
    ]);

    ctx.hmr.registerEntryImporter(importerId, [entryId]);
    ctx.hmr.registerEntryImporter(importerId, [otherEntryId]);

    expect(ctx.hmr.entryImporters.get(entryId)).toBeUndefined();
    expect(ctx.hmr.entryImporters.get(otherEntryId)).toStrictEqual(new Set([importerId]));
  });

  it('should add entry exceptions to Vite watcher ignored options', async () => {
    const ctx = await createTestContext({ targets: [] });
    const existingIgnore = /existing/;
    ctx.entries = new Map([[entryId, createMockEntryData()]]);
    Object.assign(ctx.config, {
      server: {
        watch: {
          ignored: existingIgnore,
        },
      },
    });

    ctx.hmr.includeEntriesInWatcherOptions();

    expect(ctx.config.server.watch?.ignored).toStrictEqual([`!${entryId}`, existingIgnore]);
  });

  it('should add registered entries to Vite watcher', async () => {
    const ctx = await createTestContext({ targets: [] });
    const add = vi.fn();
    ctx.entries = new Map([[entryId, createMockEntryData()]]);

    ctx.hmr.watchEntryFiles({ add });

    expect(add).toHaveBeenCalledWith([entryId]);
  });
});
