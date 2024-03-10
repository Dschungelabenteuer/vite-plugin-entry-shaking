import type { ResolveFn, ResolvedConfig } from 'vite';
import type { EventBus } from './event-bus';
import type {
  ExtendedTargets,
  PluginEntries,
  PluginMetrics,
  FinalPluginOptions,
  DebuggerEvents,
} from './types';

import { Logger } from './logger';

import EntryAnalyzer from './analyze-entry';
import { parseId } from './urls';
import { transformIfNeeded } from './transform';
import { loadEventBus } from './utils';
import { extensions } from './options';
import { Diagnostics } from './diagnostics';
import { Timer } from './timer';

/** Plugin's context. */
export class Context {
  /** Vite resolver. */
  public resolver: ResolveFn;

  /** Map of analyzed entries. */
  public entries: PluginEntries = new Map();

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
    public config: ResolvedConfig,
  ) {
    this.registerTargets();
    this.resolver = config.createResolver();
    this.logger = new Logger(config.logger, false);
    this.logger.info('Plugin configuration resolved');
    this.diagnostics = new Diagnostics(this.options);
    this.timer = new Timer(this.logger);
  }

  /**  Initializes the plugin context. */
  public async init() {
    this.entries = (await EntryAnalyzer.analyzeEntries(this)) ?? new Map();

    if (this.options.debug) {
      const { EventBus } = await loadEventBus();
      this.eventBus = new EventBus();
      this.logger.getOntoEventBus(this.eventBus);
    }
  }

  /**
   * Loads a file from the entries.
   * @param id Path to the file.
   */
  public loadFile(id: string) {
    const { url, serveSource } = parseId(id);
    const entry = this.entries.get(url);

    if (entry) {
      const version = serveSource ? 'original' : 'mutated';
      const output = serveSource ? entry.source : entry.updatedSource;
      this.logger.info(`Serving ${version} version entry file ${url}`);
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

  /**
   * Checks if hot update matches any of the entries.
   * If it does, re-triggers the analysis of that entry.
   * @param id Path to the file.
   */
  public async checkUpdate(id: string) {
    const entryFile = this.entries.get(id);

    if (entryFile) {
      this.logger.info(`HMR requires new analysis of ${id}`);
      await EntryAnalyzer.doAnalyzeEntry(this, id, entryFile.depth);
    }
  }

  /** Registers targets from the plugin options. */
  private registerTargets() {
    this.targets = new Map(this.options.targets.map((target) => [target, 0]));
  }
}
