import type { Alias } from 'vite';
import { normalizePath } from 'vite';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';
import resolveId, { handleAliases } from '../src/resolve';

const replacement = 'path/to/mocks';
const aliases: Alias[] = [
  { find: '@mocks', replacement },
  { find: /^@regex/, replacement },
];

describe('handleAliases', () => {
  it('should replace path aliases (string alias) ', () => {
    const path = '@mocks/target.ts';
    expect(handleAliases(path, aliases)).toStrictEqual(`${replacement}/target.ts`);
  });

  it('should replace path aliases (regex alias) ', () => {
    const path = '@regex/target.ts';
    expect(handleAliases(path, aliases)).toStrictEqual(`${replacement}/target.ts`);
  });

  it('should return the very same path if it does not include any path alias', () => {
    const path = 'path/to/target.ts';
    expect(handleAliases(path, aliases)).toStrictEqual(path);
  });
});

describe('resolveId', () => {
  it('should correctly resolve relative paths', () => {
    expect(resolveId('path/to/index.ts', './Test.ts', aliases)).toStrictEqual(
      normalizePath(resolve('path/to', './Test.ts')),
    );

    expect(resolveId('path/to/index.ts', '../Test.ts', aliases)).toStrictEqual(
      normalizePath(resolve('path/to', '../Test.ts')),
    );
  });

  it('should correctly resolve paths using aliases', () => {
    expect(resolveId('path/to/index.ts', '@mocks/Test.ts', aliases)).toStrictEqual(
      normalizePath(`${replacement}/Test.ts`),
    );

    expect(resolveId('path/to/index.ts', '@mocks/subfolder/Test.ts', aliases)).toStrictEqual(
      normalizePath(`${replacement}/subfolder/Test.ts`),
    );
  });
});
