/** Vite plugin options. */
export type PluginOptions = {
  targets: PluginTargets;
  extensions?: string[];
};

/** Final plugin options. */
export type FinalPluginOptions = Required<PluginOptions>;

/** Target entry data. */
export type EntryData = {
  exports: EntryExports;
  updatedSource: string;
};

/** Target entry map. */
export type PluginEntries = Map<TargetAbsolutePath, EntryData>;

/** Named import. */
export type ImportName = string;

/** Path of the imported item. */
export type ImportPath = string;

/** Import parameters. */
export type ImportParams<T> = {
  path: T;
  importDefault: boolean;
};

/** Entry imports map. */
export type EntryImports = Map<ImportName, ImportParams<ImportPath>>;

/** Named export. */
export type ExportName = string;

/** Resolved path of aggregated export (`export … from …`). */
export type ExportOriginPath = string;

/** Entry exports map. */
export type EntryExports = Map<ExportName, ImportParams<ExportOriginPath>>;

/** Target's path/alias as used in imports. */
export type TargetPath = string;

/** Resolved absolute path of target. */
export type TargetAbsolutePath = string;

/** List of targets being processed by the plugin. */
export type PluginTargets = TargetAbsolutePath[];

/** Parsed import statement output. */
export type ParsedImportStatement = {
  namedImports: string[],
  defaultImport: string | null,
};
