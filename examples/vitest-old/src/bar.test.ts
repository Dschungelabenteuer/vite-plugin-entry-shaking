import { afterAll, expect, it, vi } from 'vitest';
import { runBar } from './run';
import { determineBarState } from './util';
import type { MaybeMocked } from './hint';

vi.mock('./util', () => ({ determineBarState: () => 'changed' }));

afterAll(() => {
  vi.resetModules();
});

it('[META] determineBarState should be stubbed implementation BUT should not be a MockFn', () => {
  // Module is mocked but specific function implementaton is set and not treated as a `MockFn`.
  expect((determineBarState as MaybeMocked).mockName).toBeUndefined();
});

it('should return "changed" (direct)', () => {
  expect(determineBarState()).toStrictEqual('changed');
});

it('should return "changed" (intermediate)', () => {
  expect(runBar()).toStrictEqual('changed');
});
