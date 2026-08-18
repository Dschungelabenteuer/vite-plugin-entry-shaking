import type { MinimalPluginContextWithoutEnvironment } from 'vite';
import { resolveConfig } from 'vite';
import { createDevServer, createModuleNode } from './utils';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { createEntryShakingPlugin } from '../src';
import { addSourceQuerySuffix } from '../src/urls';
import { resolveUnitEntry, VITE_CONFIG } from './utils';

const setupEntryShakingPlugin = async (targets: string[]) => {
  const minimalPluginContext = {} as MinimalPluginContextWithoutEnvironment;
  const [preplugin, postplugin] = createEntryShakingPlugin({ targets });
  const config = await resolveConfig(VITE_CONFIG, 'serve');
  const preConfigResolved = preplugin.configResolved;
  const mainConfigResolved = postplugin.configResolved;

  if (typeof preConfigResolved !== 'function' || typeof mainConfigResolved !== 'function') {
    throw new Error('Expected test plugins to expose configResolved hooks');
  }

  await Promise.all([
    preConfigResolved.bind(minimalPluginContext, config)(),
    mainConfigResolved.bind(minimalPluginContext, config)(),
  ]);

  return { pre: preplugin, post: postplugin, minimalPluginContext };
};

describe('createEntryShakingPlugin handleHotUpdate', () => {
  let entryId: string;

  beforeAll(async () => {
    entryId = await resolveUnitEntry('entry-a');
  });

  it('should invalidate entry variants and reload when an entry file changes', async () => {
    const timestamp = 123;
    const importerId = '/path/to/consumer.ts';
    const sourceId = addSourceQuerySuffix(entryId);
    const normalModule = createModuleNode(entryId);
    const sourceModule = createModuleNode(sourceId, entryId);
    const importerModule = createModuleNode(importerId);
    const devServer = createDevServer([normalModule, sourceModule, importerModule]);
    const { post: plugin, minimalPluginContext } = await setupEntryShakingPlugin([entryId]);
    const { invalidateModule, send, server } = devServer;
    const invalidationData = [expect.any(Set), timestamp, true];

    if (typeof plugin.transform !== 'function' || typeof plugin.handleHotUpdate !== 'function') {
      throw new Error('Expected test plugin to expose transform and handleHotUpdate hooks');
    }

    const result = await plugin.handleHotUpdate.bind(minimalPluginContext, {
      file: entryId,
      modules: [normalModule],
      server,
      timestamp,
      read: vi.fn(),
    })();

    expect(result).toStrictEqual([]);
    expect(invalidateModule).toHaveBeenCalledTimes(2);
    expect(invalidateModule).toHaveBeenNthCalledWith(1, normalModule, ...invalidationData);
    expect(invalidateModule).toHaveBeenNthCalledWith(2, sourceModule, ...invalidationData);
    expect(send).toHaveBeenCalledWith({ type: 'full-reload' });
  });

  it('should add analyzed entries to Vite watcher on server configuration', async () => {
    const { add, server } = createDevServer([]);
    const { post: plugin, minimalPluginContext } = await setupEntryShakingPlugin([entryId]);

    if (typeof plugin.configureServer !== 'function') {
      throw new Error('Expected test plugin to expose configureServer hook');
    }

    await plugin.configureServer.bind(minimalPluginContext, server)();

    expect(add).toHaveBeenCalledWith([entryId]);
  });

  it('should preserve Vite default HMR handling for non-entry files', async () => {
    const otherModule = createModuleNode('/path/to/other.ts');
    const { invalidateModule, send, server } = createDevServer([otherModule]);
    const { post: plugin, minimalPluginContext } = await setupEntryShakingPlugin([entryId]);

    if (typeof plugin.handleHotUpdate !== 'function') {
      throw new Error('Expected test plugin to expose handleHotUpdate hook');
    }

    const result = await plugin.handleHotUpdate.bind(minimalPluginContext, {
      file: otherModule.id!,
      modules: [otherModule],
      server,
      timestamp: 456,
      read: vi.fn(),
    })();

    expect(result).toBeUndefined();
    expect(invalidateModule).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});
