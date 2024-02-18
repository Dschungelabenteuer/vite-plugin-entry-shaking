import { NamedExportOne } from '../../../modules/named-exports';
export { NamedExportOne };
export { NamedExportOne as NamedExportOneDupe } from '../../../modules/named-exports';

/** Below content should not be removed from the transformed target. */
import "../../../modules/sideffect-module";
import { ConsumedExport } from '../../../modules/consumed-export';
export const ExportDefinedFromTarget = 'ExportDefinedFromTarget';
const CodeDefinedFromTarget = `CodeDefinedFromTarget: ${ConsumedExport}`;
console.info('This is being printed from target, which means target was requested', CodeDefinedFromTarget);
