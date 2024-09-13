import { describe, it } from 'vitest';

import type { CaseTarget } from '../../utils';
import { resolveModule } from '../../utils';
import { createCaseTarget, setupCase, testCase } from '../../utils';

const casePath = '@test-cases/default-export-jsx';

/**
 * @note The following example shows the consumer file, not the target content.
 * @example ```ts
 *   import DefaultTargetExportTsx, { NamedExportTsxOne } from '@target';
 * ```
 */
export function testHasDefaultExportJSX(middleTarget?: CaseTarget) {
  describe('Some tsx file imports default export of target', () => {
    const targetName = `${casePath}/has-default-export`;

    it(`should work when simply importing target's default export`, async () => {
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import DefaultImportTsx from '${importPath}';\n`;
      const output = `import { default as DefaultImportTsx } from '${importPath}';\n`;
      await testCase(targetList, input, output);
    });

    it(`should work when importing target's default export with explicit default keyword`, async () => {
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { default as Something } from '${importPath}';\n`;
      const output = `import { default as Something } from '${importPath}';\n`;
      await testCase(targetList, input, output);
    });

    it(`should work when importing target's default export multiple times`, async () => {
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { default as Something, default as SomethingElse } from '${importPath}';\n`;
      const output = `import { default as Something, default as SomethingElse } from '${importPath}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

/**
 * @example ```ts
 *   export { default as AliasDefault };
 * ```
 */
export function testWithDefaultDirectReexportJSX(middleTarget?: CaseTarget) {
  describe('Target directly re-exports a default-exported-JSX entity from a third-party jsx module', () => {
    const targetName = `${casePath}/with-default-direct-reexport-jsx`;
    const sourceModule = 'default-export-jsx';

    it(`should work when target directly re-exports a default import`, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImportJSX } from '${importPath}';\n`;
      const output = `import { default as DefaultImportJSX } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it('should work when target directly re-exports a default import multiple times', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImportJSX, DefaultImportJSXDupe } from '${importPath}';\n`;
      const output = `import { default as DefaultImportJSX, default as DefaultImportJSXDupe } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

export function testWithDefaultDirectReexportUnNamedJSX(middleTarget?: CaseTarget) {
  describe('Target directly re-exports an unnamed-default-exported-JSX entity from a third-party jsx module', () => {
    const targetName = `${casePath}/with-default-direct-reexport-unnamed-jsx`;
    const sourceModule = 'default-export-unnamed-jsx';

    it(`should work when target directly re-exports a default import`, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImportJSX } from '${importPath}';\n`;
      const output = `import { default as DefaultImportJSX } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it('should work when target directly re-exports a default import multiple times', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImportJSX, DefaultImportJSXDupe } from '${importPath}';\n`;
      const output = `import { default as DefaultImportJSX, default as DefaultImportJSXDupe } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

export function testWithDefaultDirectReexportArrowFunctionJSX(middleTarget?: CaseTarget) {
  describe('Target directly re-exports an unnamed-default-exported-JSX entity from a third-party jsx module', () => {
    const targetName = `${casePath}/with-default-direct-reexport-arrow-function-jsx`;
    const sourceModule = 'default-export-arrow-function-jsx';

    it(`should work when target directly re-exports a default import`, async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImportJSX } from '${importPath}';\n`;
      const output = `import { default as DefaultImportJSX } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it('should work when target directly re-exports a default import multiple times', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImportJSX, DefaultImportJSXDupe } from '${importPath}';\n`;
      const output = `import { default as DefaultImportJSX, default as DefaultImportJSXDupe } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

export function testDefaultExportJSX(middleTarget?: CaseTarget) {
  describe('Some file imports from a target named export(s) that were directly re-exported from a JSX module', () => {
    testHasDefaultExportJSX(middleTarget);
    testWithDefaultDirectReexportJSX(middleTarget);
    testWithDefaultDirectReexportUnNamedJSX(middleTarget)
  });
}
