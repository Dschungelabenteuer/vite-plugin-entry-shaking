import { describe, it } from 'vitest';

import type { CaseTarget } from '../../utils';
import { resolveModule } from '../../utils';
import { createCaseTarget, setupCase, testCase } from '../../utils';
import { DUPE_EXPORT_EXPECTATION, ALIAS_IMPORT_EXPECTATION, COMMON_EXPECTATION, } from '../../utils';

const casePath = '@test-cases/named-export-import-reexport';

/**
 * @example ```ts
 *   import { NamedExportOne } from '@test-modules/named-exports';
 *   export { NamedExportOne };
 * ```
 */
export function testNamedExportImportReexportSingle(middleTarget?: CaseTarget) {
  describe('single re-export', () => {
    const targetName = `${casePath}/single`;

    it(`should work when target imports then re-exports a module. ${COMMON_EXPECTATION}`, async () => {
      const resolved = await resolveModule('named-exports');
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOne } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(DUPE_EXPORT_EXPECTATION, async () => {
      const resolved = await resolveModule('named-exports');
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOneDupe } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOneDupe } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(ALIAS_IMPORT_EXPECTATION, async () => {
      const resolved = await resolveModule('named-exports');
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOneDupe as NEO } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NEO } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

/**
 * @example ```ts
 *   import { NamedExportOne, NamedExportTwo } from '@test-modules/named-exports';
 *   export { NamedExportOne, NamedExportTwo };
 * ```
 */
export function testNamedExportImportReexportMultiple(middleTarget?: CaseTarget) {
  describe('multiple re-exports', () => {
    const targetName = `${casePath}/multiple`;

    it(`should work when target imports then re-exports modules. ${COMMON_EXPECTATION}`, async () => {
      const resolved = await resolveModule('named-exports');
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne, NamedExportTwo } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOne, NamedExportTwo as NamedExportTwo } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(DUPE_EXPORT_EXPECTATION, async () => {
      const resolved = await resolveModule('named-exports');
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOneDupe, NamedExportTwo } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOneDupe, NamedExportTwo as NamedExportTwo } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(ALIAS_IMPORT_EXPECTATION, async () => {
      const resolved = await resolveModule('named-exports');
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOneDupe as NEO, NamedExportTwo as NEO2 } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NEO, NamedExportTwo as NEO2 } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

export function testNamedExportImportReexport(middleTarget?: CaseTarget) {
  testNamedExportImportReexportSingle(middleTarget);
  testNamedExportImportReexportMultiple(middleTarget);
}