import { resolve } from 'path';
import type { Plugin, ViteDevServer } from 'vite';
import { createServer, normalizePath } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

import { createEntryShakingPlugin } from '../src';

const fixtureRoot = normalizePath(resolve(__dirname, '__mocks__/remap'));
const consumerPath = normalizePath(resolve(fixtureRoot, 'consumer.ts'));
const modeWatcherConsumerPath = normalizePath(resolve(fixtureRoot, 'consumer-mode-watcher.ts'));
const coreEntryPath = normalizePath(
  resolve(fixtureRoot, 'node_modules/@cms/core/admin/dist/lib/index.ts'),
);
const coreModeWatcherPath = normalizePath(
  resolve(fixtureRoot, 'node_modules/@cms/core/admin/dist/lib/mode-watcher.ts'),
);
const testEntryPath = normalizePath(
  resolve(fixtureRoot, 'node_modules/@cms/test/admin/dist/lib/index.ts'),
);
const testModeWatcherPath = normalizePath(
  resolve(fixtureRoot, 'node_modules/@cms/test/admin/dist/lib/mode-watcher.ts'),
);

type RemapMode = 'package-entry' | 'concrete-file';

function remapCmsCoreAdmin(
  mode: RemapMode,
  remapModeWatcher = false,
  remapTopLevel = false,
): Plugin {
  return {
    name: `test-remap-cms-core-admin-${mode}`,
    enforce: 'pre',
    async resolveId(id, importer) {
      if (!importer && !remapTopLevel) return null;
      if (id !== '@cms/core/admin' && (!remapModeWatcher || id !== 'mode-watcher')) return;

      if (mode === 'concrete-file') return testEntryPath;

      const resolved = await this.resolve('@cms/test/admin', importer, { skipSelf: true });
      return resolved ?? null;
    },
  };
}

async function createFixtureServer(
  target: string,
  remapMode?: RemapMode,
  remapModeWatcher = false,
  remapTopLevel = false,
) {
  return await createServer({
    appType: 'custom',
    configFile: false,
    logLevel: 'silent',
    root: fixtureRoot,
    optimizeDeps: {
      include: [],
      noDiscovery: true,
    },
    server: {
      hmr: false,
      middlewareMode: true,
    },
    plugins: [
      ...(remapMode ? [remapCmsCoreAdmin(remapMode, remapModeWatcher, remapTopLevel)] : []),
      ...createEntryShakingPlugin({ maxWildcardDepth: 5, targets: [target] }),
    ],
  });
}

function fsUrl(path: string) {
  return `/@fs/${path}`;
}

function expectCodeUsesPackage(code: string, packageName: 'core' | 'test') {
  const otherPackageName = packageName === 'core' ? 'test' : 'core';
  expect(code).toContain(`/node_modules/@cms/${packageName}/admin/dist/lib/ModeWatcher.svelte`);
  expect(code).toContain(`/node_modules/@cms/${packageName}/admin/dist/lib/object.ts`);
  expect(code).toContain(`/node_modules/@cms/${packageName}/admin/dist/lib/mode-watcher.ts`);
  expect(code).not.toContain(`/node_modules/@cms/${otherPackageName}/admin/dist/lib/ModeWatcher.svelte`);
  expect(code).not.toContain(`/node_modules/@cms/${otherPackageName}/admin/dist/lib/object.ts`);
  expect(code).not.toContain(`/node_modules/@cms/${otherPackageName}/admin/dist/lib/index.ts`);
  expect(code).not.toContain(`/node_modules/@cms/${otherPackageName}/admin/dist/lib/mode-watcher.ts`);
  expect(code).not.toContain('@cms_test_admin');
  expect(code).toContain('default as ModeWatcher');
}

function expectEntryReexportsModeWatcher(entry: string, packageName: 'core' | 'test') {
  expect(entry).toContain(`/node_modules/@cms/${packageName}/admin/dist/lib/mode-watcher.ts`);
}

function expectModeWatcherProvidesString(modeWatcher: string, packageName: 'core' | 'test') {
  expect(modeWatcher).toMatch(new RegExp(`export const String = ["']${packageName}-string["'];`));
}

async function transformFile(server: ViteDevServer, path: string) {
  const result = await server.transformRequest(fsUrl(path));
  if (!result) throw new Error('Expected consumer transform result');
  return result.code;
}

describe('resolveId remapped package entries', () => {
  let server: ViteDevServer | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it('preserves normal direct entry-shaking behavior without a remap', async () => {
    server = await createFixtureServer('@cms/core/admin');

    const code = await transformFile(server, consumerPath);
    const entry = await transformFile(server, coreEntryPath);
    const modeWatcher = await transformFile(server, coreModeWatcherPath);

    expectCodeUsesPackage(code, 'core');
    expectEntryReexportsModeWatcher(entry, 'core');
    expectModeWatcherProvidesString(modeWatcher, 'core');
  });

  it('uses the final resolved package entry before building and using its export map', async () => {
    server = await createFixtureServer('@cms/core/admin', 'package-entry');

    const code = await transformFile(server, consumerPath);
    const entry = await transformFile(server, testEntryPath);
    const modeWatcher = await transformFile(server, testModeWatcherPath);

    expectCodeUsesPackage(code, 'test');
    expectEntryReexportsModeWatcher(entry, 'test');
    expectModeWatcherProvidesString(modeWatcher, 'test');
    expect(entry).not.toContain("export { ObjectValue } from './object';");
  });

  it('uses a remap to a concrete file as the target entry identity', async () => {
    server = await createFixtureServer('@cms/core/admin', 'concrete-file');

    const code = await transformFile(server, consumerPath);
    const entry = await transformFile(server, testEntryPath);
    const modeWatcher = await transformFile(server, testModeWatcherPath);

    expectCodeUsesPackage(code, 'test');
    expectEntryReexportsModeWatcher(entry, 'test');
    expectModeWatcherProvidesString(modeWatcher, 'test');
  });

  it('registers top-level targets through the final plugin container resolver', async () => {
    server = await createFixtureServer('@cms/core/admin', 'concrete-file', false, true);

    expect(server.watcher.options.ignored).toContain(`!${testEntryPath}`);
    expect(server.watcher.options.ignored).not.toContain(`!${coreEntryPath}`);
  });

  it('watches importer-resolved entries and their late wildcard entries', async () => {
    server = await createFixtureServer('@cms/core/admin', 'package-entry');

    await transformFile(server, consumerPath);

    expect(server.watcher.options.ignored).toContain(`!${testEntryPath}`);
    expect(server.watcher.options.ignored).toContain(`!${testModeWatcherPath}`);
  });

  it('rewrites a non-target source import when another plugin resolves it to a target package entry', async () => {
    server = await createFixtureServer('@cms/core/admin', 'package-entry', true);

    const code = await transformFile(server, modeWatcherConsumerPath);
    const entry = await transformFile(server, testEntryPath);
    const modeWatcher = await transformFile(server, testModeWatcherPath);

    expectCodeUsesPackage(code, 'test');
    expectEntryReexportsModeWatcher(entry, 'test');
    expectModeWatcherProvidesString(modeWatcher, 'test');
    expect(code).not.toContain('from "mode-watcher"');
    expect(code).not.toContain("from 'mode-watcher'");
  });
});
