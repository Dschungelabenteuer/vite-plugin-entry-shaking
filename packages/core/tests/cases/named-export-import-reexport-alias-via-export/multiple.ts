import { NamedExportOne, NamedExportTwo } from '@test-modules/named-exports';
export { NamedExportOne, NamedExportTwo as AliasedNamedExportTwo };
export { NamedExportOne as NamedExportOneDupe, NamedExportTwo as NamedExportTwoDupe } from '@test-modules/named-exports';

/** Below content should not be removed from the transformed target. */
import { ConsumedExport } from '@test-modules/consumed-export';
export const ExportDefinedFromTarget = 'ExportDefinedFromTarget';
const CodeDefinedFromTarget = `CodeDefinedFromTarget: ${ConsumedExport}`;
console.info('This is being printed from target, which means target was requested', CodeDefinedFromTarget);
