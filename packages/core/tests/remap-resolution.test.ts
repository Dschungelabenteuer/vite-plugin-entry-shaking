import { resolve } from 'path';
import type { Plugin, ViteDevServer } from 'vite';
import { createServer, normalizePath } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

import { createEntryShakingPlugin } from '../src';

const fixtureRoot = normalizePath(resolve(__dirname, '__mocks__/remap'));
const consumerPath = normalizePath(resolve(fixtureRoot, 'consumer.ts'));
const testConsumerPath = normalizePath(resolve(fixtureRoot, 'consumer-test.ts'));
const testEntryPath = normalizePath(
  resolve(fixtureRoot, 'node_modules/@cms/test/admin/dist/lib/index.ts'),
);

type RemapMode = 'package-entry' | 'concrete-file';

function remapCmsCoreAdmin(mode: RemapMode): Plugin {
  return {
    name: `test-remap-cms-core-admin-${mode}`,
    enforce: 'pre',
    async resolveId(id, importer) {
      if (id !== '@cms/core/admin') return;

      if (mode === 'concrete-file') return testEntryPath;

      const resolved = await this.resolve('@cms/test/admin', importer, { skipSelf: true });
      return resolved ?? null;
    },
  };
}

async function createFixtureServer(target: string, remapMode?: RemapMode) {
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
      ...(remapMode ? [remapCmsCoreAdmin(remapMode)] : []),
      ...createEntryShakingPlugin({ targets: [target] }),
    ],
  });
}

function fsUrl(path: string) {
  return `/@fs/${path}`;
}

function expectCodeUsesTestEntry(code: string) {
  expect(code).toContain('/node_modules/@cms/test/admin/dist/lib/object.ts');
  expect(code).toContain('/node_modules/@cms/test/admin/dist/lib/index.ts');
  expect(code).not.toContain('/node_modules/@cms/core/admin/dist/lib/object.ts');
  expect(code).not.toContain('/node_modules/@cms/core/admin/dist/lib/index.ts');
  expect(code).not.toContain('@cms_test_admin');
}

function expectEntryProvidesString(entry: string) {
  expect(entry).toMatch(/export const String = ["']test-string["'];/);
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
    server = await createFixtureServer('@cms/test/admin');

    const code = await transformFile(server, testConsumerPath);
    const entry = await transformFile(server, testEntryPath);

    expectCodeUsesTestEntry(code);
    expectEntryProvidesString(entry);
  });

  it('uses the final resolved package entry before building and using its export map', async () => {
    server = await createFixtureServer('@cms/core/admin', 'package-entry');

    const code = await transformFile(server, consumerPath);
    const entry = await transformFile(server, testEntryPath);

    expectCodeUsesTestEntry(code);
    expectEntryProvidesString(entry);
    expect(entry).not.toContain("export { ObjectValue } from './object';");
  });

  it('uses a remap to a concrete file as the target entry identity', async () => {
    server = await createFixtureServer('@cms/core/admin', 'concrete-file');

    const code = await transformFile(server, consumerPath);
    const entry = await transformFile(server, testEntryPath);

    expectCodeUsesTestEntry(code);
    expectEntryProvidesString(entry);
  });
});
