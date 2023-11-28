import DefaultImport from '@test-modules/default-export';
import DefaultImportDupe from '@test-modules/default-export';
import { default as YetAnotherDefaultImport } from '@test-modules/default-export';
export { DefaultImport };
export { DefaultImportDupe };
export { YetAnotherDefaultImport };

/** Below content should not be removed from the transformed target. */
import { ConsumedExport } from '@test-modules/consumed-export';
export const ExportDefinedFromTarget = 'ExportDefinedFromTarget';
const CodeDefinedFromTarget = `CodeDefinedFromTarget: ${ConsumedExport}`;
console.info('This is being printed from target, which means target was requested', CodeDefinedFromTarget);
export default "Default export from target";
