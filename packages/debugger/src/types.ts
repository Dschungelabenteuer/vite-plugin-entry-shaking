import type { Log, PluginEntries, PluginMetrics, TransformData } from 'vite-plugin-entry-shaking';

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
  /** List of transforms. */
  transforms: TransformData[];
  /** List of targets. */
  entries: PluginEntries;
  /** List of logs. */
  logs: Log[];
  /** Channel status. */
  status: 'disconnected' | 'connected' | 'connecting';
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** ID of file we want to compute diffs from. */
export type DiffsFileId = string & { __brand: 'DiffsFileId' };

/** Diffs request payload sent to Worker. */
export interface DiffsRequestPayload {
  /** Absolute path to the file. */
  id: DiffsFileId;
  /** Original source content. */
  from: string;
  /** Updated source content. */
  to: string;
}

/** Diffs response payload received from Worker. */
export interface DiffsResponsePayload {
  /** Absolute path to the file. */
  id: DiffsFileId;
  /** All diffs content (source code with diff lines). */
  result: string;
}

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
