import { afterAll, expect, it, vi } from 'vitest';
import { runFoo } from './run';
import { Foo } from './util';
import type { MaybeMocked } from './hint';

vi.mock('./util');

afterAll(() => {
  vi.resetModules();
});

it('[META] Foo.determineFooState should be mocked', () => {
  expect((Foo.determineFooState as MaybeMocked).mockName).not.toBeUndefined();
});

it('should return undefined since it\'s being mocked without implementation (direct)', () => {
  expect(Foo.determineFooState()).toStrictEqual(undefined);
});

it('should return undefined since it\'s being mocked without implementation (intermediate)', () => {
  expect(runFoo()).toStrictEqual(undefined);
});
