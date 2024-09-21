import { describe, it } from 'vitest';

import type { CaseTarget } from '../../utils';
import { resolveModule } from '../../utils';
import { createCaseTarget, setupCase, testCase } from '../../utils';

const casePath = '@test-cases/wildcard-import-reexport';

export function testWildcardImportRexport(middleTarget?: CaseTarget) {
  describe('Wildcard import being reexportd', () => {
    const targetName = `${casePath}/wildcard`;

    it('should tree-shake when wildcard-exported module is another target', async () => {
      const resolved = await resolveModule('named-exports');
      const target = await createCaseTarget(targetName, 1);
      const otherTarget = await createCaseTarget('@test-modules/named-exports');
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExports } from '${importPath}';\n`;
      const output = `import * as NamedExports from '${resolved}';\n`;
      await testCase([...targetList, otherTarget], input, output);
    });

    it('should not transform if maxWildcardDepth was not set and module is not a target', async () => {
      const target = await createCaseTarget(targetName);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExports } from '${importPath}';\n`;
      await testCase(targetList, input, input);
    });

    it('should not transform if maxWildcardDepth is set to 0 and module is not a target', async () => {
      const target = await createCaseTarget(targetName);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExports } from '${importPath}';\n`;
      await testCase(targetList, input, input, { maxWildcardDepth: 0 });
    });

    it('should transform if maxWildcardDepth was set and not reached', async () => {
      const resolved = await resolveModule('named-exports');
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExports } from '${importPath}';\n`;
      const output = `import * as NamedExports from '${resolved}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 2 });
    });

    it('should not transform if maxWildcardDepth was set and reached', async () => {
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExports } from '${importPath}';\n`;
      await testCase(targetList, input, input, { maxWildcardDepth: 1 });
    });
  });
}
