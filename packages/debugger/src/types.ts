import type {
  Log,
  PluginEntries,
  Diagnostic,
  PluginMetrics,
  PluginTransforms,
  PluginOptions,
} from 'vite-plugin-entry-shaking';

/** Information about the consuming package. */
export interface ConsumerPackageInfo {
  /**
   * Name of the consuming package.
   * @default `"Debugger"` if `package.json` could not be resolved.
   */
  name: string;
  /**
   * Version of the consuming package.
   * @default `undefined` if `package.json` could not be resolved.
   */
  version?: string;
}

/** Channel status. */
type ChannelStatus =
  /** When using the debugger on data whose source Vite server was disconnected. */
  | 'disconnected'
  /** When using the debugger on data whose source Vite is connected. */
  | 'connected'
  /** When using the debugger on data whose source Vite server is reconnecting. */
  | 'connecting';

/**
 * Data store structure.
 * This represents data shared between both debugger and the consuming Vite-based applciation.
 */
export interface ChannelStore {
  /** Vite server's root directory. */
  root: string;
  /** Name of the debugged package. */
  name: string;
  /** Version of the debugged package. */
  version?: string;
  /** Root dir of the debugged package. */
  rootDir: string;
  /** Information about the consuming package. */
  consumer: ConsumerPackageInfo;
  /** Plugin metrics. */
  metrics: PluginMetrics;
  /** Plugin diagnostics. */
  diagnostics: { list: Diagnostic[]; listPerPath: Map<string, number[]> };
  /** List of transforms. */
  transforms: PluginTransforms;
  /** List of targets. */
  entries: PluginEntries;
  /** List of logs. */
  logs: Log[];
  /** List of options. */
  options: PluginOptions & {
    diagnostics: Required<Exclude<PluginOptions['diagnostics'], boolean>>;
  };
  /** Channel status. */
  status: ChannelStatus;
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Paths to a file. */
export type Paths = {
  /** Entry's absolute path. */
  absolutePath: string;
  /** Entry's absolute path. */
  relativePath: string;
};
