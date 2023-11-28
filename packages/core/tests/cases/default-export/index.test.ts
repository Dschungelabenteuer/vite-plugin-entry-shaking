import { describe, it } from 'vitest';
import { resolvePath, resolveModule, testCase, getPathTypeDescribeLabel } from '../../utils';

const casePath = '@test-cases/default-export';

describe('Default imports/exports', () => {
  describe('re-exporting default imports from target', async () => {
    const testTarget = async (targetName: string) => {
      const describeLabel = getPathTypeDescribeLabel(targetName);

      describe(describeLabel, () => {
        it(`should work when target re-exports a simple default import`, async () => {
          const resolved = await resolveModule('default-export');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { DefaultImport } from '${target}';\n`;
          const output = `import { default as DefaultImport } from '${resolved}';\n`;
          await testCase(target, input, output, 3);
        });

        it('should work when target re-exports several aliases of a default import', async () => {
          const resolved = await resolveModule('default-export');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { DefaultImport, DefaultImportDupe } from '${target}';\n`;
          const output = `import { default as DefaultImport, default as DefaultImportDupe } from '${resolved}';\n`;
          await testCase(target, input, output, 3);
        });

        it('should work when target re-exports an aliased default import', async () => {
          // e.g. `import { default as Alias } from './some-module'`
          const resolved = await resolveModule('default-export');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { YetAnotherDefaultImport } from '${target}';\n`;
          const output = `import { default as YetAnotherDefaultImport } from '${resolved}';\n`;
          await testCase(target, input, output, 3);
        });
      });
    };

    await testTarget('relative');
    await testTarget('alias');
  });

  describe('re-exporting default export of target', async () => {
    const testTarget = async (targetName: string) => {
      const describeLabel = getPathTypeDescribeLabel(targetName);

      describe(describeLabel, () => {
        it(`should work when simply importing target's default export`, async () => {
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import DefaultImport from '${target}';\n`;
          const output = `import { default as DefaultImport } from '${target}';\n`;
          await testCase(target, input, output, 3);
        });

        it(`should work when importing target's default export with explicit default keyword`, async () => {
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { default as Something } from '${target}';\n`;
          const output = `import { default as Something } from '${target}';\n`;
          await testCase(target, input, output, 3);
        });

        it(`should work when importing target's default export multiple times`, async () => {
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { default as Something, default as SomethingElse } from '${target}';\n`;
          const output = `import { default as Something, default as SomethingElse } from '${target}';\n`;
          await testCase(target, input, output, 3);
        });
      });
    };

    await testTarget('relative');
    await testTarget('alias');
  });
});
