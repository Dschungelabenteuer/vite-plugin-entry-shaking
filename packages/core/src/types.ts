/** Vite plugin options. */
export type PluginOptions = {
  targets: PluginTargets;
  extensions?: string[];
  ignorePatterns?: any[];
  debug?: boolean;
};

/** Final plugin options. */
export type FinalPluginOptions = Required<PluginOptions>;

/** Target entry data. */
export type EntryData = {
  exports: EntryExports;
  source: string;
  updatedSource: string;
};

/** Target entry map. */
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

/** Parsed import statement output. */
export type ParsedImportStatement = {
  namedImports: string[];
  defaultImport: string | null;
};

/** Import statement string. */
export type ImportStatement = `import ${string}`;
