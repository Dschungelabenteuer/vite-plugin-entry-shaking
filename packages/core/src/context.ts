import type { ResolvedConfig } from 'vite';
import type { EventBus } from './event-bus';
import type {
  DebuggerEvents,
  ExtendedTargets,
  FinalPluginOptions,
  PluginEntries,
  PluginMetrics,
  TransformData,
} from './types';

import { Logger } from './logger';

import EntryAnalyzer from './analyze-entry';
import { parseId } from './urls';
import { transformIfNeeded } from './transform';
import { loadEventBus } from './utils';
import { extensions } from './options';
import { Diagnostics } from './diagnostics';
import { HMR } from './hmr';
import { Resolver } from './resolver';
import { Timer } from './timer';

/** Plugin's context. */
export class Context {
  /** Plugin's resolver utilities. */
  public resolver: Resolver;

  /** Plugin's HMR utilities. */
  public hmr: HMR;

  /** Map of analyzed entries. */
  public entries: PluginEntries = new Map();

  /** Whether targets and entries have already been initialized. */
  private initialized = false;

  /** Map of registered targets. */
  public targets: ExtendedTargets = new Map();

  /** Plugin's logger. */
  public logger: Logger;

  /** Plugin's diagnostics. */
  public diagnostics: Diagnostics;

  /** Plugin's performance utilities. */
  public timer: Timer;

  /** Plugin's Event Bus. */
  public eventBus?: EventBus;

  /** Plugin's transforms. */
  public transforms: Map<string, TransformData> = new Map();

  /** Plugin's metrics. */
  public metrics: PluginMetrics = {
    analysis: 0,
    transform: 0,
    process: 0,
    jsRequests: 0,
    otherRequests: 0,
  };

  /**
   * Creates the plugin context.
   * @param options Plugin options.
   * @param config Resolved Vite config.
   */
  constructor(
    public options: Required<FinalPluginOptions>,
    public config: ResolvedConfig
  ) {
    this.logger = new Logger(config.logger, false);
    this.logger.info('Plugin configuration resolved');
    this.diagnostics = new Diagnostics(this.options);
    this.timer = new Timer(this.logger);
    this.resolver = new Resolver(this, config.createResolver());
    this.hmr = new HMR(this);
  }

  /** Initializes the plugin context. */
  public async init() {
    if (this.initialized) return;

    await this.resolver.registerTargets();
    this.entries = await EntryAnalyzer.analyzeEntries(this);

    if (this.options.debug) {
      const { EventBus } = await loadEventBus();
      this.eventBus = new EventBus();
      this.logger.getOntoEventBus(this.eventBus);
    }

    this.initialized = true;
  }

  /**
   * Loads a file from the entries.
   * @param id Path to the file.
   */
  public loadFile(id: string) {
    const { url, serveSource } = parseId(id);
    const entryId = this.resolver.normalizeId(url);
    const entry = this.entries.get(entryId);

    if (entry) {
      const version = serveSource ? 'original' : 'mutated';
      const output = serveSource ? entry.source : entry.updatedSource;
      this.logger.info(`Serving ${version} version entry file ${entryId}`);
      return output;
    }
  }

  /**
   * Transforms a file (if needed).
   * @param code Source code of the file.
   * @param id Path to the file.
   */
  public async transformFile(code: string, id: string) {
    if (this.options.debug) {
      const ext = id.split('.').pop()!;
      const eventName: keyof DebuggerEvents = extensions.includes(ext)
        ? 'incrementJsRequests'
        : 'incrementOtherRequests';

      this.eventBus?.emit(eventName);
    }

    return await transformIfNeeded(this, id, code);
  }
}
