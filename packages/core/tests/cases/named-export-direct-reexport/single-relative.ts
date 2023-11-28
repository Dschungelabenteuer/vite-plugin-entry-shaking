export { NamedExportOne } from '../../__mocks__/modules/named-exports';
export { NamedExportOne as NamedExportOneDupe } from '../../__mocks__/modules/named-exports';

/** Below content should not be removed from the transformed target. */
import { ConsumedExport } from '@test-modules/consumed-export';
export const ExportDefinedFromTarget = 'ExportDefinedFromTarget';
const CodeDefinedFromTarget = `CodeDefinedFromTarget: ${ConsumedExport}`;
console.info('This is being printed from target, which means target was requested', CodeDefinedFromTarget);
export default "Default export from target";