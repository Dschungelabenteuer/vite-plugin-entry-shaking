import DefaultImport from '@test-modules/default-export';
import DefaultImportDupe from '@test-modules/default-export';
export { DefaultImport, DefaultImportDupe };

/** Below content should not be removed from the transformed target. */
import "@test-modules/sideffect-module";
import { ConsumedExport } from '@test-modules/consumed-export';
export const ExportDefinedFromTarget = 'ExportDefinedFromTarget';
const CodeDefinedFromTarget = `CodeDefinedFromTarget: ${ConsumedExport}`;
console.info('This is being printed from target, which means target was requested', CodeDefinedFromTarget);

