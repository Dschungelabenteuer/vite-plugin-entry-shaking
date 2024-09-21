import * as NamedExports from '@test-modules/named-exports';
export { NamedExports };

/** Below content should not be removed from the transformed target. */
import '@test-modules/sideffect-module';
import { ConsumedExport } from '@test-modules/consumed-export';
export const ExportDefinedFromTarget = 'ExportDefinedFromTarget';
const CodeDefinedFromTarget = `CodeDefinedFromTarget: ${ConsumedExport}`;
console.info(
  'This is being printed from target, which means target was requested',
  CodeDefinedFromTarget,
);
