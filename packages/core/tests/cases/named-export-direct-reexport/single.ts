export { NamedExportOne } from '@test-modules/named-exports';
export { NamedExportOne as NamedExportOneDupe } from '@test-modules/named-exports';
export { NamedExportFunction } from '@test-modules/named-exports';
export { NamedExportEnum } from '@test-modules/named-exports';
export { NamedExportConstEnum } from '@test-modules/named-exports';
export { NamedExportType } from '@test-modules/named-exports';
export type { NamedExportType as NamedExportTypeOnly } from '@test-modules/named-exports';

/** Below content should not be removed from the transformed target. */
import "@test-modules/sideffect-module";
import { ConsumedExport } from '@test-modules/consumed-export';
export const ExportDefinedFromTarget = 'ExportDefinedFromTarget';
const CodeDefinedFromTarget = `CodeDefinedFromTarget: ${ConsumedExport}`;
console.info('This is being printed from target, which means target was requested', CodeDefinedFromTarget);
