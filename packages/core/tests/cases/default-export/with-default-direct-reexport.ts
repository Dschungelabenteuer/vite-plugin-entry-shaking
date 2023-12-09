export { default as DefaultImport } from '@test-modules/default-export';
export { default as DefaultImportDupe } from '@test-modules/default-export';

/** Below content should not be removed from the transformed target. */
import { ConsumedExport } from '@test-modules/consumed-export';
export const ExportDefinedFromTarget = 'ExportDefinedFromTarget';
const CodeDefinedFromTarget = `CodeDefinedFromTarget: ${ConsumedExport}`;
console.info('This is being printed from target, which means target was requested', CodeDefinedFromTarget);
