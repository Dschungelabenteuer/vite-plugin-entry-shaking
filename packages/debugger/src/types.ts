import type {
  Log,
  PluginEntries,
  Diagnostic,
  PluginMetrics,
  TransformData,
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
export type ChannelStatus =
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
  transforms: Map<string, TransformData>;
  /** List of targets. */
  entries: PluginEntries;
  /** List of logs. */
  logs: Log[];
  /** List of options. */
  options: PluginOptions & {
    diagnostics: Required<Exclude<PluginOptions['diagnostics'], boolean>>;
  };
  /** Channel status. */
  status: 'disconnected' | 'connected' | 'connecting';
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/**
 * Plugin channel messages.
 * This defines the types of all accepted messages between client and Vite server
 * through a common context instance.
 * */
export interface ChannelMessages {
  /**
   * Increases plugin's process time by `time`ms.
   * @param time Time (in ms) to add to the process time.
   */
  increaseProcessTime: (time: number) => void;
  /**
   * Registers a transformed file and its metrics.
   * @param transform Transformed file data.
   */
  registerTransform: (transform: any) => void;
}

/** Returns known keys of a given object type/interface. */
export type KnownKeys<T> = {
  -readonly [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};

/** Paths to a file. */
export type Paths = {
  /** Entry's absolute path. */
  absolutePath: string;
  /** Entry's absolute path. */
  relativePath: string;
};
