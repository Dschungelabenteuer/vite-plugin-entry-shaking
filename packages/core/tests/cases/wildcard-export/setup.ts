import { describe, it } from 'vitest';

import type { CaseTarget } from '../../utils';
import { constructCircularImport, resolveModule } from '../../utils';
import { createCaseTarget, setupCase, testCase } from '../../utils';

const casePath = '@test-cases/wildcard-export';

export function testWildcardExportWithoutAlias(middleTarget?: CaseTarget) {
  describe('Wildcard export (without alias)', () => {
    const targetName = `${casePath}/wildcard`;

    it('should tree-shake when wildcard-exported module is another target', async () => {
      const resolved = await resolveModule('named-exports');
      const target = await createCaseTarget(targetName, 1);
      const otherTarget = await createCaseTarget('@test-modules/named-exports');
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOne } from '${resolved}';\n`;
      await testCase([...targetList, otherTarget], input, output);
    });

    it('should not transform if maxWildcardDepth was not set and module is not a target', async () => {
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne } from '${importPath}';\n`;
      await testCase(targetList, input, input);
    });

    it('should not transform if maxWildcardDepth is set to 0 and module is not a target', async () => {
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne } from '${importPath}';\n`;
      await testCase(targetList, input, input, { maxWildcardDepth: 0 });
    });

    it('should transform if maxWildcardDepth was set and not reached', async () => {
      const resolved = await resolveModule('named-exports');
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOne } from '${resolved}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 2 });
    });

    it('should not transform if maxWildcardDepth was set and reached', async () => {
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne } from '${importPath}';\n`;
      await testCase(targetList, input, input, { maxWildcardDepth: 1 });
    });
  });
}

export function testWildcardExportWithAlias(middleTarget?: CaseTarget) {
  describe('Wildcard export (with alias)', () => {
    const targetName = `${casePath}/wildcard-alias`;

    it('should replace with an aliased wildcard-import of the actual source if it is another target', async () => {
      const resolved = await resolveModule('named-exports');
      const target = await createCaseTarget(targetName);
      const otherTarget = await createCaseTarget('@test-modules/named-exports');
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { AliasedWildcard } from '${importPath}';\n`;
      const output = constructCircularImport(resolved!, ['NamedExportOne', 'NamedExportTwo'], 'AliasedWildcard');
      await testCase([...targetList, otherTarget], input, output);
    });

    it('should not transform if maxWildcardDepth was not set and module is not a target', async () => {
      const target = await createCaseTarget(targetName);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { AliasedWildcard } from '${importPath}';\n`;
      await testCase(targetList, input, input);
    });

    it('should not transform if maxWildcardDepth is set to 0 and module is not a target', async () => {
      const target = await createCaseTarget(targetName);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { AliasedWildcard } from '${importPath}';\n`;
      await testCase(targetList, input, input, { maxWildcardDepth: 0 });
    });

    it('should replace with an aliased wildcard-import of the actual source', async () => {
      // We're not expecting named-exports since middle "wildcard-two" module could export anything else.
      const target = await createCaseTarget(`${casePath}/wildcard-one-alias`);
      const expectedPath = (await createCaseTarget(`${casePath}/wildcard-two`)).path;
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { AliasedWildcard } from '${importPath}';\n`;
      const output = constructCircularImport(expectedPath, ['ExportedFromWildcardTwo'], 'AliasedWildcard');
      await testCase(targetList, input, output, { maxWildcardDepth: 2 });
    });
  });
}

export function testWildcardExport(middleTarget?: CaseTarget) {
  testWildcardExportWithoutAlias(middleTarget);
  testWildcardExportWithAlias(middleTarget);
}

