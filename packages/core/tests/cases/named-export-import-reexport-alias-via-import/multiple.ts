import { NamedExportOne as AliasedNamedExportOne, NamedExportTwo as AliasedNamedExportTwo  } from '@test-modules/named-exports';
export { AliasedNamedExportOne, AliasedNamedExportTwo };
export { NamedExportOne as NamedExportOneDupe, NamedExportTwo as NamedExportTwoDupe } from '@test-modules/named-exports';

/** Below content should not be removed from the transformed target. */
import "@test-modules/sideffect-module";
import { ConsumedExport } from '@test-modules/consumed-export';
export const ExportDefinedFromTarget = 'ExportDefinedFromTarget';
const CodeDefinedFromTarget = `CodeDefinedFromTarget: ${ConsumedExport}`;
console.info('This is being printed from target, which means target was requested', CodeDefinedFromTarget);
