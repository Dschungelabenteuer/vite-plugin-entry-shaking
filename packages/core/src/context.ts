import type { ResolveFn, ResolvedConfig } from 'vite';
import type { EventBus } from './event-bus';
import type {
  ExtendedTargets,
  PluginEntries,
  PluginMetrics,
  PluginOptions,
  PerformanceDuration,
} from './types';

import { Logger } from './logger';

import EntryAnalyzer from './analyze-entry';
import { parseId } from './urls';
import { transformIfNeeded } from './transform';
import { loadEventBus } from './utils';

/** Plugin's context. */
export class Context {
  /** Map of analyzed entries. */
  public entries: PluginEntries = new Map();

  /** Map of registered targets. */
  public targets: ExtendedTargets = new Map();

  /** Plugin's logger. */
  public logger: Logger;

  /** Vite resolver. */
  public resolver: ResolveFn;

  /** Plugin's Event Bus. */
  public eventBus?: EventBus;

  /** Plugin's metrics. */
  public metrics: PluginMetrics = {
    analysis: { time: 0, self: 0 },
    process: 0,
  };

  constructor(
    public options: Required<PluginOptions>,
    public config: ResolvedConfig,
  ) {
    this.registerTargets();
    this.resolver = config.createResolver();
    this.logger = new Logger(config.logger, false);
    this.logger.info('Plugin configuration resolved');
  }

  public async init() {
    this.entries = (await EntryAnalyzer.analyzeEntries(this)) ?? new Map();
    if (this.options.debug) {
      const { EventBus } = await loadEventBus();
      this.eventBus = new EventBus();
      this.logger.getOnTheEventBus(this.eventBus);
    }
  }

  public async measure<
    Title extends string,
    Callback extends (...args: any[]) => any,
    Silent extends boolean,
    Return = Callback extends (...args: any[]) => infer R ? R : any,
  >(
    title: Title,
    callback: Callback,
    silent?: Silent,
  ): Promise<PerformanceDuration & { out?: Awaited<Return> }> {
    if (!silent) this.logger.debug(`${title} started`);
    const startTime = performance.now();
    const out = await callback();
    const time = performance.now() - startTime;
    if (!silent) this.logger.debug(`${title} ended, it took ${time.toFixed(2)}ms`);
    return { out, time, self: time };
  }

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

  public async transformFile(code: string, id: string) {
    return await transformIfNeeded(this, id, code);
  }

  public async updateFile(id: string) {
    const entryFile = this.entries.get(id);
    if (entryFile) {
      this.logger.info(`HMR requires new analysis of ${id}`);
      await EntryAnalyzer.doAnalyzeEntry(this, id, entryFile.depth);
    }
  }

  private registerTargets() {
    this.targets = new Map(this.options.targets.map((target) => [target, 0]));
  }
}
