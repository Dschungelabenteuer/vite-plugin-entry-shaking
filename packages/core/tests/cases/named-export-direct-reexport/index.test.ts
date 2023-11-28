import { describe, it } from 'vitest';
import {
  resolvePath,
  resolveModule,
  testCase,
  DUPE_EXPORT_EXPECTATION,
  ALIAS_IMPORT_EXPECTATION,
  COMMON_EXPECTATION,
  getPathTypeDescribeLabel,
} from '../../utils';

const casePath = '@test-cases/named-export-direct-reexport';

describe('Direct re-export of named export(s)', () => {
  /**
   * @example ```ts
   *   export { NamedExportOne } from '@test-modules/named-exports';
   * ```
   */
  describe('single re-export', async () => {
    const testTarget = async (targetName: string) => {
      const describeLabel = getPathTypeDescribeLabel(targetName);

      describe(describeLabel, () => {
        it(`should work when target directly exports a module. ${COMMON_EXPECTATION}`, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { NamedExportOne } from '${target}';\n`;
          const output = `import { NamedExportOne as NamedExportOne } from '${resolved}';\n`;
          await testCase(target, input, output);
        });

        it(DUPE_EXPORT_EXPECTATION, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { NamedExportOneDupe } from '${target}';\n`;
          const output = `import { NamedExportOne as NamedExportOneDupe } from '${resolved}';\n`;
          await testCase(target, input, output);
        });

        it(ALIAS_IMPORT_EXPECTATION, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { NamedExportOneDupe as NEO } from '${target}';\n`;
          const output = `import { NamedExportOne as NEO } from '${resolved}';\n`;
          await testCase(target, input, output);
        });
      });
    };

    await testTarget('single-relative');
    await testTarget('single-alias');
  });

  /**
   * @example ```ts
   *   export { NamedExportOne, NamedExportTwo } from '@test-modules/named-exports';
   * ```
   */
  describe('multiple re-exports', async () => {
    const testTarget = async (targetName: string) => {
      const describeLabel = getPathTypeDescribeLabel(targetName);

      describe(describeLabel, () => {
        it(`should work when target directly exports multiple modules. ${COMMON_EXPECTATION}`, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { NamedExportOne, NamedExportTwo } from '${target}';\n`;
          const output = `import { NamedExportOne as NamedExportOne, NamedExportTwo as NamedExportTwo } from '${resolved}';\n`;
          await testCase(target, input, output);
        });

        it(DUPE_EXPORT_EXPECTATION, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { NamedExportOneDupe, NamedExportTwo } from '${target}';\n`;
          const output = `import { NamedExportOne as NamedExportOneDupe, NamedExportTwo as NamedExportTwo } from '${resolved}';\n`;
          await testCase(target, input, output);
        });

        it(ALIAS_IMPORT_EXPECTATION, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { NamedExportOneDupe as NEO, NamedExportTwo as NEO2 } from '${target}';\n`;
          const output = `import { NamedExportOne as NEO, NamedExportTwo as NEO2 } from '${resolved}';\n`;
          await testCase(target, input, output);
        });
      });
    };

    await testTarget('multiple-relative');
    await testTarget('multiple-alias');
  });
});
