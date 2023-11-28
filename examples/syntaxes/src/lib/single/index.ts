/**
 * These should illustrate most supported syntaxes.
 * - Those tests are dedicated to single-entity import/export statements.
 * - We also want to test multiple aliased exports of the same item (dupes).
 */

// Direct re-export of a named export.
export { NamedExport } from './named-export';
export { NamedExport as NamedExportDupe } from './named-export';

// Import/re-export of a named export.
import { NamedExportOne } from './named-export-1';
export { NamedExportOne };
export { NamedExportOne as NamedExportOneDupe };

// Import/re-export of a named export which was aliased via import.
import { NamedExportTwo as NamedExport2 } from './named-export-2';
export { NamedExport2 };
export { NamedExport2 as NamedExport2Dupe };

// Import/re-export as alias of a named export.
import { NamedExportThree } from './named-export-3';
export { NamedExportThree as NamedExport3 };
export { NamedExportThree as NamedExport3Dupe };

// Import/re-export of a default export.
import DefaultExport from '../default-export';
export { DefaultExport };
export { DefaultExport as DefaultExportDupe };

/**
 * @todo
 */

import * as C from './wildcard';
export { C };

import * as D from './wildcard';
export const DE = D;

export * from './wildcard';
export * as Prout from './wildcard'

/**
 * These should never be loaded if not imported by `main.ts`.
 * - They should never appear in the network tab.
 * - They should be cleaned up of the updated entry file.
 */

// Import/re-export of a named export.
import { NamedExportUnused } from './named-export-unused';
export { NamedExportUnused };

// Import/re-export of a default export.
import DefaultExportUnused from '../default-export';
export { DefaultExportUnused };





