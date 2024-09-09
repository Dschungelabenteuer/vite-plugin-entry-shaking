export const NamedExportOne = 'NamedExportOne';
export const NamedExportTwo: string = 'NamedExportTwo';

export function NamedExportFunction() {
  return 'NamedExportFunction';
}

const NamedExportThree = 'NamedExportThree';

export type NamedExportType = string;
type NamedExportTypeAlias = NamedExportType;
export interface NamedExportInterface {
  /* ... */
}

export enum NamedExportEnum {
  One = 'One',
  Two = 'Two',
}

export const enum NamedExportConstEnum {
  One = 'One',
  Two = 'Two',
}

export namespace  NamedExportNamespace {
    // …
}

export { NamedExportThree, NamedExportTypeAlias };
