import { afterAll, expect, it, vi } from 'vitest';
import { runBar } from './run';
import { determineBarState } from './util';
import type { MaybeMocked } from './hint';

vi.mock('./util/bar', () => ({ determineBarState: () => 'changed' }));

afterAll(() => {
  vi.resetModules();
});

it('[META] determineBarState should be stubbed implementation BUT should not be a MockFn', () => {
  // Mocked module's functions  are not
  expect((determineBarState as MaybeMocked).mockName).toBeUndefined();
});

it('should return "changed"', () => {
  expect(runBar()).toStrictEqual('changed');
});
