import type { ModuleGraph, ModuleNode, ViteDevServer } from 'vite';
import { resolveConfig } from 'vite';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { createEntryShakingPlugin } from '../src';
import { addSourceQuerySuffix } from '../src/urls';
import { resolveUnitEntry, VITE_CONFIG } from './utils';

const createModule = (id: string, file = id.split('?')[0]) =>
  ({
    id,
    file,
    url: id,
  }) as ModuleNode;

const createServer = (modules: ModuleNode[]) => {
  const modulesById = new Map(modules.map((module) => [module.id, module]));
  const invalidateModule = vi.fn();
  const send = vi.fn();
  const add = vi.fn();
  const moduleGraph = {
    getModuleById: vi.fn((id: string) => modulesById.get(id)),
    getModulesByFile: vi.fn(
      (file: string) => new Set(modules.filter((module) => module.file === file)),
    ),
    invalidateModule,
  } as unknown as ModuleGraph;

  const server = {
    moduleGraph,
    watcher: {
      add,
      options: { ignored: [] },
    },
    ws: {
      send,
    },
  } as unknown as ViteDevServer;

  return { add, invalidateModule, send, server };
};

const getEntryShakingPlugin = async (targets: string[]) => {
  const plugins = createEntryShakingPlugin({ targets });
  const config = await resolveConfig(VITE_CONFIG, 'serve');
  const preConfigResolved = plugins[0].configResolved;
  const mainConfigResolved = plugins[1].configResolved;

  if (typeof preConfigResolved !== 'function' || typeof mainConfigResolved !== 'function') {
    throw new Error('Expected test plugins to expose configResolved hooks');
  }

  await preConfigResolved(config);
  await mainConfigResolved(config);

  return plugins[1];
};

describe('createEntryShakingPlugin handleHotUpdate', () => {
  let entryId: string;

  beforeAll(async () => {
    entryId = await resolveUnitEntry('entry-a');
  });

  it('should re-analyze, invalidate entry variants and reload when an entry file changes', async () => {
    const sourceId = addSourceQuerySuffix(entryId);
    const importerId = '/path/to/consumer.ts';
    const normalModule = createModule(entryId);
    const sourceModule = createModule(sourceId, entryId);
    const importerModule = createModule(importerId);
    const { invalidateModule, send, server } = createServer([
      normalModule,
      sourceModule,
      importerModule,
    ]);
    const plugin = await getEntryShakingPlugin([entryId]);
    const timestamp = 123;

    await plugin.transform?.("import { A_MODULE_A } from '@mocks/entry-a';", importerId);

    const result = await plugin.handleHotUpdate?.({
      file: entryId,
      modules: [normalModule],
      server,
      timestamp,
      read: vi.fn(),
    });

    expect(result).toStrictEqual([]);
    expect(invalidateModule).toHaveBeenCalledTimes(3);
    expect(invalidateModule).toHaveBeenNthCalledWith(
      1,
      normalModule,
      expect.any(Set),
      timestamp,
      true,
    );
    expect(invalidateModule).toHaveBeenNthCalledWith(
      2,
      sourceModule,
      expect.any(Set),
      timestamp,
      true,
    );
    expect(invalidateModule).toHaveBeenNthCalledWith(
      3,
      importerModule,
      expect.any(Set),
      timestamp,
      true,
    );
    expect(send).toHaveBeenCalledWith({ type: 'full-reload' });
  });

  it('should add analyzed entries to Vite watcher on server configuration', async () => {
    const { add, server } = createServer([]);
    const plugin = await getEntryShakingPlugin([entryId]);
    const configureServer = plugin.configureServer;

    if (typeof configureServer !== 'function') {
      throw new Error('Expected test plugin to expose configureServer hook');
    }

    await configureServer(server);

    expect(add).toHaveBeenCalledWith([entryId]);
  });

  it('should preserve Vite default HMR handling for non-entry files', async () => {
    const otherModule = createModule('/path/to/other.ts');
    const { invalidateModule, send, server } = createServer([otherModule]);
    const plugin = await getEntryShakingPlugin([entryId]);

    const result = await plugin.handleHotUpdate?.({
      file: otherModule.id!,
      modules: [otherModule],
      server,
      timestamp: 456,
      read: vi.fn(),
    });

    expect(result).toBeUndefined();
    expect(invalidateModule).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});
