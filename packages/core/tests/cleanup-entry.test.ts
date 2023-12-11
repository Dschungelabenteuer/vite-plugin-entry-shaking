import { describe, it, expect, beforeAll } from 'vitest';
import dedent from 'ts-dedent';
import { init, parse } from 'es-module-lexer';
import EntryCleaner from '../src/cleanup-entry';
import type { EntryExports } from '../src/types';

const mockedRawEntry = dedent(`
  import A_MODULE_D from '@mocks/entry-a/modules/D';
  import A_MODULE_A from './modules/A';
  import A_MODULE_B from './modules/B';
  import A_MODULE_C from './modules/C';

  import { A_MODULE_E, A_MODULE_F } from './modules/EF';
  import { G as A_MODULE_G } from './modules/G';
  export const REMAINING = 'remaining';

  export { A_MODULE_H } from './modules/H';
  export { default as A_MODULE_I, J as A_MODULE_J } from './modules/IJ';
  export { A_MODULE_A };
  export { A_MODULE_B };
  export { A_MODULE_C, A_MODULE_D, REMAINING };
  export {
    A_MODULE_E,
    A_MODULE_F,
  };

  export { A_MODULE_G };

  export const test = 'test';

  export default () => {

  };
`);

const mockedRemovedResolvedEntry = dedent(`
  import A_MODULE_D from '@mocks/entry-a/modules/D';
  import A_MODULE_A from './modules/A';
  import A_MODULE_B from './modules/B';
  import A_MODULE_C from './modules/C';

  import { A_MODULE_E, A_MODULE_F } from './modules/EF';
  import { G as A_MODULE_G } from './modules/G';
  export const REMAINING = 'remaining';

  export {  } from './modules/H';
  export { , } from './modules/IJ';
  export {  };
  export {  };
  export { , , REMAINING };
  export {
    ,
    ,
  };

  export {  };

  export const test = 'test';

  export default () => {

  };
`);

const mockedRemovedEmptyEntry = dedent(`
  import A_MODULE_D from '@mocks/entry-a/modules/D';
  import A_MODULE_A from './modules/A';
  import A_MODULE_B from './modules/B';
  import A_MODULE_C from './modules/C';

  import { A_MODULE_E, A_MODULE_F } from './modules/EF';
  import { G as A_MODULE_G } from './modules/G';
  export const REMAINING = 'remaining';





  export { , , REMAINING };




  export const test = 'test';

  export default () => {

  };
`);

const mockedCleanedEntry = dedent(`
  import A_MODULE_D from '@mocks/entry-a/modules/D';
  import A_MODULE_A from './modules/A';
  import A_MODULE_B from './modules/B';
  import A_MODULE_C from './modules/C';

  import { A_MODULE_E, A_MODULE_F } from './modules/EF';
  import { G as A_MODULE_G } from './modules/G';
  export const REMAINING = 'remaining';





  export { REMAINING };




  export const test = 'test';

  export default () => {

  };
`);

const getMockedExports = async (content?: string) => {
  await init;
  const [, exports] = await parse(content ?? mockedRawEntry);
  return exports;
};

const mockedEntryMap: EntryExports = new Map([
  ['A_MODULE_H', { importDefault: false, path: './modules/H' }],
  ['A_MODULE_I', { importDefault: true, path: './modules/IJ' }],
  ['A_MODULE_J', { importDefault: false, path: './modules/IJ' }],
  ['A_MODULE_D', { importDefault: true, path: './modules/D' }],
  ['A_MODULE_A', { importDefault: true, path: './modules/A' }],
  ['A_MODULE_B', { importDefault: true, path: './modules/B' }],
  ['A_MODULE_C', { importDefault: true, path: './modules/C' }],
  ['A_MODULE_E', { importDefault: false, path: './modules/EF' }],
  ['A_MODULE_F', { importDefault: false, path: './modules/EF' }],
  ['A_MODULE_G', { importDefault: false, path: './modules/G' }],
]);

let mockedExports: any = [];

beforeAll(async () => {
  mockedExports = await getMockedExports();
});

describe('reformatRemainingExports', () => {
  it('should correctly reformat remaining exports (integration)', () => {
    const output = EntryCleaner.reformatRemainingExports(mockedRemovedEmptyEntry);
    expect(output).toStrictEqual(mockedCleanedEntry);
  });
});

describe('removeEmptyExports', () => {
  it('should correctly remove empty exports (integration)', () => {
    const output = EntryCleaner.removeEmptyExports(mockedRemovedResolvedEntry);
    expect(output).toStrictEqual(mockedRemovedEmptyEntry);
  });
});

describe('removeResolvedExports', () => {
  it('should correctly remove resolved exports (integration)', () => {
    const output = EntryCleaner.removeResolvedExports(
      mockedRawEntry,
      mockedEntryMap,
      mockedExports,
    );

    expect(output).toStrictEqual(mockedRemovedResolvedEntry);
  });

  it('should not remove self-defined exports', async () => {
    const input = 'export const SomeDefinedCode = "value";';
    const exports = await getMockedExports(input);
    const entryExports: EntryExports = new Map([
      ['SomeDefinedCode', { selfDefined: true, path: '/some/path', importDefault: false }],
    ]);
    const output = EntryCleaner.removeResolvedExports(input, entryExports, exports);

    expect(output).toStrictEqual(input);
  });
});

describe('cleanupEntry', () => {
  it('should correctly clean up entry file (integration)', () => {
    const output = EntryCleaner.cleanupEntry(mockedRawEntry, mockedEntryMap, mockedExports);
    expect(output).toStrictEqual(mockedCleanedEntry);
  });
});
