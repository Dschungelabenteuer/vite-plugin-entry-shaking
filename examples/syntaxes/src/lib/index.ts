// Direct re-export of a named export.
export { NamedExport } from './single/named-export';
export { NamedExport as NamedExportDupe } from './single/named-export';

// Import/re-export of a named export.
import { NamedExportOne } from './single/named-export-1';
export { NamedExportOne };
export { NamedExportOne as NamedExportOneDupe };

// Import/re-export of a named export which was aliased via import.
import { NamedExportTwo as NamedExport2 } from './single/named-export-2';
export { NamedExport2 };
export { NamedExport2 as NamedExport2Dupe };

// Import/re-export as alias of a named export.
import { NamedExportThree } from './single/named-export-3';
export { NamedExportThree as NamedExport3 };
export { NamedExportThree as NamedExport3Dupe };

// Import/re-export of a default export.
import DefaultExport from './default-export';
export { DefaultExport };
export { DefaultExport as DefaultExportDupe };


/**
 * These should never be loaded if not imported by `main.ts`.
 * - They should never appear in the network tab.
 * - They should be cleaned up of the updated entry file.
 */

// Import/re-export of a named export.
import { NamedExportUnused } from './single/named-export-unused';
export { NamedExportUnused };

// Import/re-export of a default export.
import DefaultExportUnused from './default-export';
export { DefaultExportUnused };





