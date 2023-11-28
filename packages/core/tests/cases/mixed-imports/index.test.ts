import { describe, it } from 'vitest';
import { resolvePath, resolveModule, testCase, getPathTypeDescribeLabel } from '../../utils';

const casePath = '@test-cases/mixed-export';

describe('Mixed imports', () => {
  describe('re-exporting mixed import imports from target', async () => {
    const testTarget = async (targetName: string) => {
      const describeLabel = getPathTypeDescribeLabel(targetName);

      describe(describeLabel, () => {
      });
    };

    await testTarget('relative');
    await testTarget('alias');
  });

  describe('mixed imports of target', async () => {
    const testTarget = async (targetName: string) => {
      const describeLabel = getPathTypeDescribeLabel(targetName);

      describe(describeLabel, () => {
      });
    };

    await testTarget('relative');
    await testTarget('alias');
  });
});
