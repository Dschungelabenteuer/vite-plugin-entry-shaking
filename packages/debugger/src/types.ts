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
  /** List of transforms. */
  transforms: any[];
  /** List of targets. */
  entries: any;
  /** List of logs. */
  logs: any[];
  /** Channel status. */
  status: 'disconnected' | 'connected' | 'connecting';
}
