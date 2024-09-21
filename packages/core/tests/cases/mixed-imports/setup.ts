import { it, describe } from 'vitest';

import type { CaseTarget } from '../../utils';
import { resolveModule } from '../../utils';
import { createCaseTarget, setupCase, testCase } from '../../utils';

const casePath = '@test-cases/mixed-imports';

/**
 * @example ```ts
 *   import DefaultImport, { NamedExportOne } from '@test-modules/mixed-import';
 *   export { DefaultImport, NamedExportOne } from '@test-modules/named-exports';
 * ```
 */
export function testMixedImportsInTarget(middleTarget?: CaseTarget) {
  describe('Some file imports from a target named exports that were imported using mixed import syntax', () => {
    const targetName = `${casePath}/mixed`;

    it(`should work when target re-exports a simple default import`, async () => {
      const resolved = await resolveModule('mixed-import');
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { MixedDefault, MixedImportNamed } from '${importPath}';\n`;
      const output = `import { default as MixedDefault, MixedImportNamed as MixedImportNamed } from '${resolved}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

/**
 * @note The following example shows the consumer file, not the target content.
 * @example ```ts
 *   import DefaultTargetExport, { NamedExportOne } from '@target';
 * ```
 */
export function testMixedImportsOfTarget(middleTarget?: CaseTarget) {
  describe('Some file imports from a target both the default and a named export', () => {
    const targetName = `${casePath}/mixed`;

    it(`should work when importing both the default and a named export from target`, async () => {
      const resolved = await resolveModule('mixed-import');
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import Entry, { MixedDefault } from '${importPath}';\n`;
      const output =
        '' +
        `import { default as MixedDefault } from '${resolved}';\n` +
        `import { default as Entry } from '${importPath}';\n`;
      await testCase(targetList, input, output);
    });
  });
}

export function testMixedImports(middleTarget?: CaseTarget) {
  testMixedImportsInTarget(middleTarget);
  testMixedImportsOfTarget(middleTarget);
}
