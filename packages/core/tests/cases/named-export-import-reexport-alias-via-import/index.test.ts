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

const casePath = '@test-cases/named-export-import-reexport-alias-via-import';

describe('Import/re-export of named export(s) using alias on import', () => {
  /**
   * @example ```ts
   *   import { NamedExportOne as AliasedNamedExportOne } from '@test-modules/named-exports';
   *   export { AliasedNamedExportOne };
   * ```
   */
  describe('single re-export', async () => {
    const testTarget = async (targetName: string) => {
      const describeLabel = getPathTypeDescribeLabel(targetName);

      describe(describeLabel, () => {
        it(`should work when target imports then re-exports a module using an alias. ${COMMON_EXPECTATION}`, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { AliasedNamedExportOne } from '${target}';\n`;
          const output = `import { NamedExportOne as AliasedNamedExportOne } from '${resolved}';\n`;
          await testCase(target, input, output, 1);
        });

        it(DUPE_EXPORT_EXPECTATION, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { NamedExportOneDupe } from '${target}';\n`;
          const output = `import { NamedExportOne as NamedExportOneDupe } from '${resolved}';\n`;
          await testCase(target, input, output, 1);
        });

        it(ALIAS_IMPORT_EXPECTATION, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { AliasedNamedExportOne as NEO } from '${target}';\n`;
          const output = `import { NamedExportOne as NEO } from '${resolved}';\n`;
          await testCase(target, input, output, 1);
        });
      });
    };

    await testTarget('single-relative');
    await testTarget('single-alias');
  });

  /**
   * @example ```ts
   *   import { NamedExportOne, NamedExportTwo as AliasedNamedExportTwo } from '@test-modules/named-exports';
   *   export { NamedExportOne, AliasedNamedExportTwo };
   * ```
   */
  describe('multiple re-exports', async () => {
    const testTarget = async (targetName: string) => {
      const describeLabel = targetName.endsWith('alias')
        ? 'path alias (target file imports use path aliases)'
        : 'relative path (target file imports use relative paths)';

      describe(describeLabel, () => {
        it(`should work when target imports then re-exports modules using aliases. ${COMMON_EXPECTATION}`, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { AliasedNamedExportOne, AliasedNamedExportTwo } from '${target}';\n`;
          const output = `import { NamedExportOne as AliasedNamedExportOne, NamedExportTwo as AliasedNamedExportTwo } from '${resolved}';\n`;
          await testCase(target, input, output, 1);
        });

        it(DUPE_EXPORT_EXPECTATION, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { NamedExportOneDupe, AliasedNamedExportTwo } from '${target}';\n`;
          const output = `import { NamedExportOne as NamedExportOneDupe, NamedExportTwo as AliasedNamedExportTwo } from '${resolved}';\n`;
          await testCase(target, input, output, 1);
        });

        it(ALIAS_IMPORT_EXPECTATION, async () => {
          const resolved = await resolveModule('named-exports');
          const target = await resolvePath(`${casePath}/${targetName}`);
          const input = `import { NamedExportOneDupe as NEO, AliasedNamedExportTwo as NEO2 } from '${target}';\n`;
          const output = `import { NamedExportOne as NEO, NamedExportTwo as NEO2 } from '${resolved}';\n`;
          await testCase(target, input, output, 1);
        });
      });
    };

    await testTarget('multiple-relative');
    await testTarget('multiple-alias');
  });
});
