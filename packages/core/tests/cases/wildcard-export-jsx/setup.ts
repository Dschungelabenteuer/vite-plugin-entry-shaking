import { describe, it } from 'vitest';

import type { CaseTarget } from '../../utils';
import { resolveModule } from '../../utils';
import { createCaseTarget, setupCase, testCase } from '../../utils';

const casePath = '@test-cases/wildcard-export-jsx';



export function testWildcardExportFromJSXModule(middleTarget?: CaseTarget) {
  describe('Wildcard export from jsx module', () => {
    const targetName = `${casePath}/wildcard-jsx`;
    const sourceModule = 'named-exports-jsx';

    it('should tree-shake when wildcard-exported module is another target', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 1);
      const otherTarget = await createCaseTarget('@test-modules/named-exports-jsx');
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportJSXOne } from '${importPath}';\n`;
      const output = `import { NamedExportJSXOne as NamedExportJSXOne } from '${resolved}';\n`;
      await testCase([...targetList, otherTarget], input, output);
    });

    it('should not transform if maxWildcardDepth was not set and module is not a target', async () => {
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportJSXOne } from '${importPath}';\n`;
      await testCase(targetList, input, input);
    });

    it('should not transform if maxWildcardDepth is set to 0 and module is not a target', async () => {
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportJSXOne } from '${importPath}';\n`;
      await testCase(targetList, input, input, { maxWildcardDepth: 0 });
    });

    it('should transform if maxWildcardDepth was set and not reached', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportJSXOne } from '${importPath}';\n`;
      const output = `import { NamedExportJSXOne as NamedExportJSXOne } from '${resolved}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 2 });
    });

    it('should transform if maxWildcardDepth was set and over reached', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportJSXOne } from '${importPath}';\n`;
      const output = `import { NamedExportJSXOne as NamedExportJSXOne } from '${resolved}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 100 });
    });

    it('should not transform if maxWildcardDepth was set and reached', async () => {
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportJSXOne } from '${importPath}';\n`;
      await testCase(targetList, input, input, { maxWildcardDepth: 1 });
    });
  });
}

export function testWildcardExportJSX(middleTarget?: CaseTarget) {
  testWildcardExportFromJSXModule(middleTarget);
}
