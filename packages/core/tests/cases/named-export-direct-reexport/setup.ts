import { describe, it } from 'vitest';

import type { CaseTarget } from '../../utils';
import { resolveModule } from '../../utils';
import { createCaseTarget, setupCase, testCase } from '../../utils';
import { DUPE_EXPORT_EXPECTATION, ALIAS_IMPORT_EXPECTATION, COMMON_EXPECTATION, } from '../../utils';

const casePath = '@test-cases/named-export-direct-reexport';

/**
 * @example ```ts
 *   export { NamedExportOne } from '@test-modules/named-exports';
 * ```
 */
export function testNamedExportDirectReexportSingle(middleTarget?: CaseTarget) {
  describe('single re-export', () => {
    const targetName = `${casePath}/single`;
    const sourceModule = 'named-exports';

    it(`should work when target directly exports a module. ${COMMON_EXPECTATION}`, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOne } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(`should work when target directly export a function from a module. ${COMMON_EXPECTATION}`, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportFunction } from '${importPath}';\n`;
      const output = `import { NamedExportFunction as NamedExportFunction } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(`should work when target directly export a enums from a module. ${COMMON_EXPECTATION}`, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportEnum, NamedExportConstEnum } from '${importPath}';\n`;
      const output = `import { NamedExportEnum as NamedExportEnum, NamedExportConstEnum as NamedExportConstEnum } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(`should work when target directly export a enums from a module. ${COMMON_EXPECTATION}`, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportEnum, NamedExportConstEnum } from '${importPath}';\n`;
      const output = `import { NamedExportEnum as NamedExportEnum, NamedExportConstEnum as NamedExportConstEnum } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(`should work when target directly export a type from a module. ${COMMON_EXPECTATION}`, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportType } from '${importPath}';\n`;
      const output = `import { NamedExportType as NamedExportType } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(`should not transform when target directly export a type-only type from a module. ${COMMON_EXPECTATION}`, async () => {
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportTypeOnly } from '${importPath}';\n`;
      await testCase(targetList, input, input);
    });

    it(`should not transform in type-only import.`, async () => {
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import type { NamedExportTypeOnly } from '${importPath}';\n`;
      await testCase(targetList, input, input);
    });

    it(DUPE_EXPORT_EXPECTATION, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOneDupe } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOneDupe } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(ALIAS_IMPORT_EXPECTATION, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOneDupe as NEO } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NEO } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

/**
 * @example ```ts
 *   export { NamedExportOne, NamedExportTwo } from '@test-modules/named-exports';
 * ```
 */
export function testNamedExportDirectReexportMultiple(middleTarget?: CaseTarget) {
  describe('multiple re-exports', () => {
    const targetName = `${casePath}/multiple`;
    const sourceModule = 'named-exports';

    it(`should work when target directly exports multiple modules. ${COMMON_EXPECTATION}`, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne, NamedExportTwo } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOne, NamedExportTwo as NamedExportTwo } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(DUPE_EXPORT_EXPECTATION, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOneDupe, NamedExportTwo } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOneDupe, NamedExportTwo as NamedExportTwo } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(ALIAS_IMPORT_EXPECTATION, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOneDupe as NEO, NamedExportTwo as NEO2 } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NEO, NamedExportTwo as NEO2 } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

/**
 * @example ```ts
 *   export { NamedExportOne } from '@test-modules/named-exports';
 * ```
 */
export function testNamedExportDirectReexportTsx(middleTarget?: CaseTarget) {
  describe('tsx re-export', () => {
    const targetName = `${casePath}/tsx`;
    const sourceModule = 'named-exports-tsx';

    it(`should work when target directly exports a module. ${COMMON_EXPECTATION}`, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);    
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportTsxOne } from '${importPath}';\n`;
      const output = `import { NamedExportTsxOne as NamedExportTsxOne } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(DUPE_EXPORT_EXPECTATION, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportTsxOneDupe } from '${importPath}';\n`;
      const output = `import { NamedExportTsxOne as NamedExportTsxOneDupe } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it(ALIAS_IMPORT_EXPECTATION, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportTsxOneDupe as NEO } from '${importPath}';\n`;
      const output = `import { NamedExportTsxOne as NEO } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

export function testNamedExportDirectReexport(middleTarget?: CaseTarget) {
  describe('Some file imports from a target named export(s) that were directly re-exported from source', () => {
    testNamedExportDirectReexportSingle(middleTarget);
    testNamedExportDirectReexportMultiple(middleTarget);
    testNamedExportDirectReexportTsx(middleTarget)
  });
}
