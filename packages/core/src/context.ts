import type { ResolveFn, ResolvedConfig } from 'vite';
import type { ExtendedTargets, PluginEntries, PluginOptions } from './types';
import { Logger } from './logger';

import EntryAnalyzer from './analyze-entry';
import { parseId } from './urls';
import { transformIfNeeded } from './transform';

/** Plugin's context. */
export class Context {
  /** Map of analyzed entries. */
  public entries: PluginEntries = new Map();

  /** Map of registered targets. */
  public targets: ExtendedTargets = new Map();

  /** Vite resolver. */
  public resolver: ResolveFn;

  /** Plugin's logger. */
  public logger: Logger;

  /** Plugin's debugger. */
  public debugger: any;

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
    this.entries = await EntryAnalyzer.analyzeEntries(this);
    this.logger.info(`- List of merged options: ${JSON.stringify(this.options)}`);
    this.logger.info(`- List of parsed entries: ${JSON.stringify([...this.entries.keys()])}`);
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
      /** @todo log HMR re-triggering analysis */
      await EntryAnalyzer.doAnalyzeEntry(this, id, entryFile.depth);
    }
  }

  private registerTargets() {
    this.targets = new Map(this.options.targets.map((target) => [target, 0]));
  }
}
