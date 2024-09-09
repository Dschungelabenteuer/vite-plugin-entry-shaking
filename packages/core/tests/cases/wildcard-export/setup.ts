import { describe, it } from 'vitest';

import type { CaseTarget } from '../../utils';
import { resolveModule } from '../../utils';
import { createCaseTarget, setupCase, testCase } from '../../utils';

const casePath = '@test-cases/wildcard-export';

export function testWildcardExportWithoutAlias(middleTarget?: CaseTarget) {
  describe('Wildcard export (without alias)', () => {
    const targetName = `${casePath}/wildcard`;
    const sourceModule = 'named-exports';

    it('should tree-shake when wildcard-exported module is another target', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 1);
      const otherTarget = await createCaseTarget('@test-modules/named-exports');
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOne } from '${resolved}';\n`;
      await testCase([...targetList, otherTarget], input, output);
    });

    it('should transform if imported an function', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName);
      const otherTarget = await createCaseTarget('@test-modules/named-exports');
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportFunction } from '${importPath}';\n`;
      const output = `import { NamedExportFunction as NamedExportFunction } from '${resolved}';\n`;
      await testCase([...targetList, otherTarget], input, output);
    });

    it('should transform if imported an referenced named export', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportThree } from '${importPath}';\n`;
      const output = `import { NamedExportThree as NamedExportThree } from '${resolved}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 2 });
    });

    it('should transform if imported an enums', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportEnum } from '${importPath}';\n`;
      const output = `import { NamedExportEnum as NamedExportEnum } from '${resolved}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 2 });
    });

    it('should transform if imported an const enums', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportConstEnum } from '${importPath}';\n`;
      const output = `import { NamedExportConstEnum as NamedExportConstEnum } from '${resolved}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 2 });
    });

    it('should not transform if imported an type', async () => {
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportType } from '${importPath}';\n`;
      await testCase(targetList, input, input, { maxWildcardDepth: 2 });
    });

    it('should not transform if imported an referenced type', async () => {
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportTypeAlias } from '${importPath}';\n`;
      await testCase(targetList, input, input, { maxWildcardDepth: 2 });
    });

    it('should only transform variable import if imported an variable and type', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne, NamedExportType } from '${importPath}';\n`;
      const output = [
        `import { NamedExportOne as NamedExportOne } from '${resolved}';`,
        `import { NamedExportType } from '${importPath}';`,
      ].join('\n');      
      await testCase(targetList, input, output, { maxWildcardDepth: 2 });
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
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOne } from '${resolved}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 2 });
    });

    it('should transform if maxWildcardDepth was set and over reached', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportOne } from '${importPath}';\n`;
      const output = `import { NamedExportOne as NamedExportOne } from '${resolved}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 100 });
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
    const sourceModule = 'named-exports';

    it('should replace with an aliased wildcard-import of the actual source if it is another target', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName);
      const otherTarget = await createCaseTarget('@test-modules/named-exports');
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { AliasedWildcard } from '${importPath}';\n`;
      const output = `import * as AliasedWildcard from '${resolved}';\n`;
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
      const output = `import * as AliasedWildcard from '${expectedPath}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 2 });
    });
  });
}

export function testWildcardExportTsx(middleTarget?: CaseTarget) {
  describe('Wildcard export tsx', () => {
    const targetName = `${casePath}/wildcard-tsx`;
    const sourceModule = 'named-exports-tsx';

    it('should tree-shake when wildcard-exported module is another target', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(targetName, 1);
      const otherTarget = await createCaseTarget('@test-modules/named-exports-tsx');
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportTsxOne } from '${importPath}';\n`;
      const output = `import { NamedExportTsxOne as NamedExportTsxOne } from '${resolved}';\n`;
      await testCase([...targetList, otherTarget], input, output);
    });

    it('should not transform if maxWildcardDepth was not set and module is not a target', async () => {
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportTsxOne } from '${importPath}';\n`;
      await testCase(targetList, input, input);
    });

    it('should not transform if maxWildcardDepth is set to 0 and module is not a target', async () => {
      const target = await createCaseTarget(targetName, 1);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportTsxOne } from '${importPath}';\n`;
      await testCase(targetList, input, input, { maxWildcardDepth: 0 });
    });

    it('should transform if maxWildcardDepth was set and not reached', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportTsxOne } from '${importPath}';\n`;
      const output = `import { NamedExportTsxOne as NamedExportTsxOne } from '${resolved}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 2 });
    });

    it('should transform if maxWildcardDepth was set and over reached', async () => {
      const resolved = await resolveModule(sourceModule);
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportTsxOne } from '${importPath}';\n`;
      const output = `import { NamedExportTsxOne as NamedExportTsxOne } from '${resolved}';\n`;
      await testCase(targetList, input, output, { maxWildcardDepth: 100 });
    });

    it('should not transform if maxWildcardDepth was set and reached', async () => {
      const target = await createCaseTarget(`${targetName}-one`);
      const { importPath, targetList } = setupCase(target, middleTarget);
      const input = `import { NamedExportTsxOne } from '${importPath}';\n`;
      await testCase(targetList, input, input, { maxWildcardDepth: 1 });
    });
  });
}

export function testWildcardExport(middleTarget?: CaseTarget) {
  testWildcardExportWithoutAlias(middleTarget);
  testWildcardExportWithAlias(middleTarget);
  testWildcardExportTsx(middleTarget);
}
