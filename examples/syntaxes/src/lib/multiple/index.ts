// Direct re-export of a named export.
export { NamedExport, OtherNamedExport } from './named-export';
export { NamedExport as NamedExportDupe, OtherNamedExport as OtherNamedExportDupe } from './named-export';

// Import/re-export of a named export.
import { NamedExportOne, OtherNamedExportOne } from './named-export-1';
export { NamedExportOne, OtherNamedExportOne };
export { NamedExportOne as NamedExportOneDupe, OtherNamedExportOne as OtherNamedExportOneDupe };

// Import/re-export of a named export which was aliased via import.
import { NamedExportTwo as NamedExport2, OtherNamedExportTwo } from './named-export-2';
export { NamedExport2 };
export { NamedExport2 as NamedExport2Dupe };

// Import/re-export as alias of a named export.
import { NamedExportThree } from './named-export-3';
export { NamedExportThree as NamedExport3 };
export { NamedExportThree as NamedExport3Dupe };

/**
 * These should never be loaded if not imported by `main.ts`.
 * - They should never appear in the network tab.
 * - They should be cleaned up of the updated entry file.
 */

// Import/re-export of a named export.
import { NamedExportUnused } from './named-export-unused';
export { NamedExportUnused };
