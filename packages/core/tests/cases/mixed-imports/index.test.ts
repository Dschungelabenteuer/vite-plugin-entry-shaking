import { describe, it } from 'vitest';
import { resolvePath, resolveModule, testCase, getPathTypeDescribeLabel } from '../../utils';

const casePath = '@test-cases/mixed-imports';

describe('Mixed imports', () => {
  describe('re-exporting mixed imports from target', async () => {
    const testTarget = async (targetName: string) => {
      const describeLabel = getPathTypeDescribeLabel(targetName);

      describe(describeLabel, () => {
        it(`should work when target re-exports a simple default import`, async () => {
          const resolved = await resolveModule('mixed-import');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { MixedDefault, MixedImportNamed } from '${target}';\n`;
          const output = `import { default as MixedDefault, MixedImportNamed as MixedImportNamed } from '${resolved}';\n`;
          await testCase(target, input, output, 1);
        });
      });
    };

    await testTarget('relative');
    await testTarget('alias');
  });

  describe('mixed imports of target', async () => {
    const testTarget = async (targetName: string) => {
      const describeLabel = getPathTypeDescribeLabel(targetName);

      describe(describeLabel, () => {
        it(`should work when importing both the default and a named export from target`, async () => {
          const resolved = await resolveModule('mixed-import');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import Entry, { MixedDefault } from '${target}';\n`;
          const output = ''
            + `import { default as MixedDefault } from '${resolved}';\n`
            + `import { default as Entry } from '${target}';\n`
          await testCase(target, input, output, 1);
        });
      });
    };

    await testTarget('relative');
    await testTarget('alias');
  });
});
