export {
  NamedExportOne,
  NamedExportTwo,
  NamedExportFunction,
  NamedExportEnum,
  NamedExportConstEnum,
  NamedExportType,
} from '@test-modules/named-exports';
export {
  NamedExportOne as NamedExportOneDupe,
  NamedExportTwo as NamedExportTwoDupe,
  NamedExportFunction as NamedExportFunctionDupe,
  NamedExportEnum as NamedExportEnumDupe,
  NamedExportConstEnum as NamedExportConstEnumDupe,
  NamedExportType as NamedExportTypeDupe,
} from '@test-modules/named-exports';

/** Below content should not be removed from the transformed target. */
import "@test-modules/sideffect-module";
import { ConsumedExport } from '@test-modules/consumed-export';
export const ExportDefinedFromTarget = 'ExportDefinedFromTarget';
const CodeDefinedFromTarget = `CodeDefinedFromTarget: ${ConsumedExport}`;
console.info('This is being printed from target, which means target was requested', CodeDefinedFromTarget);
