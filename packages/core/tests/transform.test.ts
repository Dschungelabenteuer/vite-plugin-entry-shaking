import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import dedent from 'ts-dedent';
import { normalizePath } from 'vite';

import type { PluginEntries } from '../src/types';
import { transformImports } from '../src/transform';

const pathToMocks = normalizePath(resolve(__dirname, '__mocks__'));
const target = normalizePath(resolve(pathToMocks, 'entry-a'));
const targets = [target];
const aliases = [{ find: '@mocks', replacement: pathToMocks }];

describe('transformImports', () => {
  it('should not transform if it does not import any target entry', async () => {
    const id = '';
    const code = `import { B_MODULE_B, test } from '@mocks/entry-b';`;
    const entries: PluginEntries = new Map([
      [target, {
        exports: new Map([['A_MODULE_A', { path: '', importDefault: true }]]),
        updatedSource: '',
      }],
    ]);

    const transformed = await transformImports(id, code, entries, targets, aliases);
    expect(transformed).toStrictEqual(undefined);
  });

  it('should transform if it does import at least one target entry', async () => {
    const id = '';
    const code = dedent(`
      const [imports3, exports3] = import("./" + "ab.js");
      import { A_MODULE_A, test } from '@mocks/entry-a';
    `);
    const entries: PluginEntries = new Map([
      [target, {
        exports: new Map([['A_MODULE_A', { path: './modules/A', importDefault: true }]]),
        updatedSource: '',
      }],
    ]);

    const transformed = await transformImports(id, code, entries, targets, aliases);
    expect(transformed).toStrictEqual(dedent(`
      const [imports3, exports3] = import("./" + "ab.js");
      import A_MODULE_A from '${target}/modules/A';
      import { test } from '@mocks/entry-a';
    `));
  });
});
