import { describe } from 'vitest';
import { createCaseTarget } from '../../utils';

import {
  testNamedExportDirectReexportSingle,
  testNamedExportDirectReexportMultiple,
} from '../named-export-direct-reexport/setup';

import {
  testNamedExportImportReexportSingle,
  testNamedExportImportReexportMultiple,
} from '../named-export-import-reexport/setup';

import {
  testNamedExportImportReexportAliasViaExportSingle,
  testNamedExportImportReexportAliasViaExportMultiple,
} from '../named-export-import-reexport-alias-via-export/setup';

import {
  testNamedExportImportReexportAliasViaImportSingle,
  testNamedExportImportReexportAliasViaImportMultiple,
} from '../named-export-import-reexport-alias-via-import/setup';

import {
  testMixedImportsInTarget,
  testMixedImportsOfTarget
} from '../mixed-imports/setup';

import {
  testHasDefaultExport,
  testWithDefaultDirectReexport,
  testWithDefaultImportReexport,
  testWithDestructuredDefaultImport,
} from '../default-export/setup';

const casePath = '@test-cases/cross-entries';

/**
 * The following tests suppose some file imports data from a `second` target which
 * exposes some code re-exported from a `first` target. When testing cross-entries
 * imports/exports, we also want to make sure all supported syntaxes work properly.
 * There are a lot of possible cases and so as to o reduce code duplication, let's
 * use other syntax-specific cases as a `first` target.
 */
export function testCrossEntriesImportsExports() {
  describe('Cross-entries imports/exports', () => {
    describe('direct re-export', async () => {
      const baseCasePath = `${casePath}/named-export-direct-reexport`;
      testNamedExportDirectReexportSingle(await createCaseTarget(`${baseCasePath}-single`));
      testNamedExportDirectReexportMultiple(await createCaseTarget(`${baseCasePath}-multiple`));
    });

    describe('import then re-export', async () => {
      const baseCasePath = `${casePath}/named-export-import-reexport`;
      testNamedExportImportReexportSingle(await createCaseTarget(`${baseCasePath}-single`));
      testNamedExportImportReexportMultiple(await createCaseTarget(`${baseCasePath}-multiple`));
    });

    describe('import then re-export an alias set via export', async () => {
      const baseCasePath = `${casePath}/named-export-import-reexport-alias-via-export`;
      testNamedExportImportReexportAliasViaExportSingle(await createCaseTarget(`${baseCasePath}-single`));
      testNamedExportImportReexportAliasViaExportMultiple(await createCaseTarget(`${baseCasePath}-multiple`));
    });

    describe('import then re-export an alias set via import', async () => {
      const baseCasePath = `${casePath}/named-export-import-reexport-alias-via-import`;
      testNamedExportImportReexportAliasViaImportSingle(await createCaseTarget(`${baseCasePath}-single`));
      testNamedExportImportReexportAliasViaImportMultiple(await createCaseTarget(`${baseCasePath}-multiple`));
    });

    describe('mixed imports', async () => {
      const baseCasePath = `${casePath}/mixed-imports`;
      testMixedImportsInTarget(await createCaseTarget(`${baseCasePath}`));
      testMixedImportsOfTarget(await createCaseTarget(`${baseCasePath}`));
    });

    describe('default export', async () => {
      const baseCasePath = `${casePath}/default-export`;
      testHasDefaultExport(await createCaseTarget(`${baseCasePath}-has-default-export`));
      testWithDefaultDirectReexport(await createCaseTarget(`${baseCasePath}-with-default-direct-reexport`));
      testWithDefaultImportReexport(await createCaseTarget(`${baseCasePath}-with-default-import-reexport`));
      testWithDestructuredDefaultImport(await createCaseTarget(`${baseCasePath}-with-destructured-default-import`));
    })

    // describe('wildcard export', async () => {
    //   const baseCasePath = `${casePath}/wildcard-export`;
    //   testWithDefaultDirectReexport(await createCaseTarget(`${baseCasePath}-with-default-direct-reexport`));
    //   testWithDefaultImportReexport(await createCaseTarget(`${baseCasePath}-with-default-import-reexport`));
    //   testWithDestructuredDefaultImport(await createCaseTarget(`${baseCasePath}-with-destructured-default-import`));
    // })
  });
}

