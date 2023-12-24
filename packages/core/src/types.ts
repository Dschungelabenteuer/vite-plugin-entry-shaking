/** Vite plugin options. */
export interface PluginOptions {
  /** List of the entry points. */
  targets: PluginTargets;
  /** Specifies which file extensions you want this plugin to process. */
  extensions?: string[];
  /** Specifies RegExp/string whose matched paths must be ignored by the plugin. */
  ignorePatterns?: any[];
  /** How deep should this plugin run static analysis when encountering wildcards? */
  maxWildcardDepth?: number | undefined;
  /** Defines whether debug mode should be enabled. */
  debug?: boolean;
}

/** Final plugin options. */
export type FinalPluginOptions = Required<PluginOptions>;

/** Target entry data. */
export interface EntryData {
  /** Source content of the entry file. */
  source: string;
  /** Cleaned-up content of the entry file. */
  updatedSource: string;
  /** Wildcard-based exports */
  wildcardExports?: WildcardExports;
  /** List of entry exports. */
  exports: EntryExports;
  /** Static analysis-wise depth at which the entry was registered. */
  depth: number;
}

/** Map of analyzed entries indexed by their absolute path. */
export type PluginEntries = Map<EntryPath, EntryData>;

/** Named import. */
export type ImportName = string;

/** Path of the imported item. */
export type ImportPath = string;

/** Import parameters. */
export type ImportParams<T = string> = {
  /** Imported path. */
  path: T;
  /** Is it a default import? */
  importDefault: boolean;
  /** Original name of the entity (as exported by its source file). */
  originalName?: string;
  /** Alias of the entity (as imported from the entry by consomming code). */
  alias?: string;
  /** Determines whether the export represents some code defined within the file. */
  selfDefined?: true;
};

/** Caught wildcard exports. */
export type WildcardExports = {
  /** Named wildcard exports (e.g. `import * as Something` or `export * as Something`). */
  named: Map<string, EntryPath>;
  /** Direct wildcard exports (e.g. `export * from './somewhere'`). */
  direct: string[];
};

/** Import inputs. */
export type ImportInput = Omit<ImportParams, 'path'> & {
  name: string;
};

/** Entry imports map. */
export type EntryImports = Map<ImportName, ImportParams<ImportPath>>;

/** Named export. */
export type ExportName = string;

/** Resolved path of aggregated export (`export … from …`). */
export type ExportOriginPath = string;

/** Entry exports map. */
export type EntryExports = Map<ExportName, ImportParams<ExportOriginPath>>;

/** Target imports map */
export type TargetImports = Map<string, ImportInput[]>;

/** Target's path/alias as used in imports. */
export type TargetPath = string;

/** Resolved absolute path of target. */
export type EntryPath = string;

/** List of targets being processed by the plugin. */
export type PluginTargets = EntryPath[];

/** List of extended targets being processed by the plugin. */
export type ExtendedTargets = Map<EntryPath, number>;

/** Extended target. */
export type ExtendedTarget = { path: EntryPath; depth: number };

/** Parsed import statement output. */
export interface ParsedImportStatement {
  /** List of named imported entities. */
  namedImports: string[];
  /** List of default imported entities. */
  defaultImports: string[];
  /** Wildcard import if any. */
  wildcardImport?: string | undefined;
}

/** Import statement string. */
export type ImportStatement = `import ${string}`;
