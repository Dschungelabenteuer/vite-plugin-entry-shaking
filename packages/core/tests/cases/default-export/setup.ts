import { describe, it } from 'vitest';

import type { CaseTarget } from '../../utils';
import { resolveModule } from '../../utils';
import { createCaseTarget, setupCase, testCase } from '../../utils';

const casePath = '@test-cases/default-export';

/**
 * @note The following example shows the consumer file, not the target content.
 * @example ```ts
 *   import DefaultTargetExport, { NamedExportOne } from '@target';
 * ```
 */
export function testHasDefaultExport(middleTarget?: CaseTarget) {
  describe('Some file imports default export of target', () => {
    const targetName = `${casePath}/has-default-export`;

    it(`should work when simply importing target's default export`, async () => {
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import DefaultImport from '${importPath}';\n`;
      const output = `import { default as DefaultImport } from '${importPath}';\n`;
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
export function testWithDefaultDirectReexport(middleTarget?: CaseTarget) {
  describe('Target directly re-exports a default-exported entity from a third-party module', () => {
    const targetName = `${casePath}/with-default-direct-reexport`;

    it(`should work when target directly re-exports a default import`, async () => {
      const resolved = await resolveModule('default-export');
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImport } from '${importPath}';\n`;
      const output = `import { default as DefaultImport } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it('should work when target directly re-exports a default import multiple times', async () => {
      const resolved = await resolveModule('default-export');
      const target = await createCaseTarget(targetName, 0);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImport, DefaultImportDupe } from '${importPath}';\n`;
      const output = `import { default as DefaultImport, default as DefaultImportDupe } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

/**
 * @example ```ts
 *   import DefaultImport from '@test-modules/default-export';
 *   export { DefaultImport };
 * ```
 */
export function testWithDefaultImportReexport(middleTarget?: CaseTarget) {
  describe('Target simply imports then name-exports a default-imported module', () => {
    const targetName = `${casePath}/with-default-import-reexport`;

    it(`should work when target imports then re-exports a simple default import`, async () => {
      const resolved = await resolveModule('default-export');
      const target = await createCaseTarget(targetName, 2);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImport } from '${importPath}';\n`;
      const output = `import { default as DefaultImport } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it('should work when target imports then re-exports a simple default import multiple times', async () => {
      const resolved = await resolveModule('default-export');
      const target = await createCaseTarget(targetName, 2);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImport, DefaultImportDupe } from '${importPath}';\n`;
      const output = `import { default as DefaultImport, default as DefaultImportDupe } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

/**
 * @example ```ts
 *   import { default as DefaultImport } from '@test-modules/default-export';
 *   export { DefaultImport };
 * ```
 */
export function testWithDestructuredDefaultImport(middleTarget?: CaseTarget) {
  describe('Target simply imports then name-exports a default-imported module (destructured default)', () => {
    const targetName = `${casePath}/with-destructured-default-import`;

    it(`should work when target imports then re-exports a default import`, async () => {
      const resolved = await resolveModule('default-export');
      const target = await createCaseTarget(targetName, 2);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImport } from '${importPath}';\n`;
      const output = `import { default as DefaultImport } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });

    it('should work when target imports then re-exports a default import multiple times', async () => {
      const resolved = await resolveModule('default-export');
      const target = await createCaseTarget(targetName, 2);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { DefaultImport, DefaultImportDupe } from '${importPath}';\n`;
      const output = `import { default as DefaultImport, default as DefaultImportDupe } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

export function testDefaultExport(middleTarget?: CaseTarget) {
  describe('Some file imports from a target named export(s) that were directly re-exported from source', () => {
    testHasDefaultExport(middleTarget);
    testWithDefaultDirectReexport(middleTarget);
    testWithDefaultImportReexport(middleTarget);
    testWithDestructuredDefaultImport(middleTarget);
  });
}
