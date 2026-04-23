import type { FSWatcher, ModuleGraph, ModuleNode, ResolveFn, ResolvedConfig } from 'vite';
import { normalizePath } from 'vite';
import type { EventBus } from './event-bus';
import type {
  ExtendedTargets,
  EntryPath,
  PluginEntries,
  PluginMetrics,
  FinalPluginOptions,
  DebuggerEvents,
} from './types';

import { Logger } from './logger';

import EntryAnalyzer from './analyze-entry';
import { addSourceQuerySuffix, parseId } from './urls';
import { transformIfNeeded } from './transform';
import Utils, { loadEventBus } from './utils';
import { extensions } from './options';
import { Diagnostics } from './diagnostics';
import { Timer } from './timer';

/** Plugin's context. */
export class Context {
  /** Vite resolver. */
  public resolver: ResolveFn;

  /** Whether targets and entries have already been initialized. */
  private initialized = false;

  /** Map of analyzed entries. */
  public entries: PluginEntries = new Map();

  /** Map of registered targets. */
  public targets: ExtendedTargets = new Map();

  /** Set of target ids exactly as configured before importer-specific resolution. */
  public targetSpecifiers = new Set<EntryPath>();

  /** Map of transformed importers indexed by the entry files they imported. */
  public entryImporters = new Map<EntryPath, Set<string>>();

  /** Vite's dev server watcher. */
  private watcher?: Pick<FSWatcher, 'add'>;

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
    this.resolver = config.createResolver();
    this.logger = new Logger(config.logger, false);
    this.logger.info('Plugin configuration resolved');
    this.diagnostics = new Diagnostics(this.options);
    this.timer = new Timer(this.logger);
  }

  /**  Initializes the plugin context. */
  public async init() {
    if (this.initialized) return;

    this.targets = new Map();
    this.targetSpecifiers.clear();
    this.entries = new Map();
    this.entryImporters.clear();

    await this.registerTargets();
    this.entries = await EntryAnalyzer.analyzeEntries(this);
    this.includeEntriesInWatcherOptions();

    if (this.options.debug) {
      const { EventBus } = await loadEventBus();
      this.eventBus = new EventBus();
      this.logger.getOntoEventBus(this.eventBus);
    }

    this.initialized = true;
  }

  /**
   * Replaces the resolver used by the plugin.
   * This invalidates any analysis previously built with another resolver.
   * @param resolver Final Vite/Rollup resolver.
   */
  public setResolver(resolver: ResolveFn) {
    this.resolver = resolver;
    this.initialized = false;
    this.targets = new Map();
    this.targetSpecifiers.clear();
    this.entries = new Map();
    this.entryImporters.clear();
  }

  /**
   * Resolves and normalizes a module id through the active Vite resolver.
   * @param id Imported id/specifier.
   * @param importer Importer id.
   * @param aliasOnly Whether only aliases should be resolved.
   * @param ssr Whether the resolution is for SSR.
   */
  public async resolve(id: string, importer?: string, aliasOnly?: boolean, ssr?: boolean) {
    const resolved = await this.resolver(id, importer, aliasOnly, ssr);
    return resolved ? this.normalizeId(resolved) : undefined;
  }

  /**
   * Normalizes a module id before using it as a target/entry cache key.
   * @param id Module id.
   */
  public normalizeId(id: string) {
    return normalizePath(parseId(id).url);
  }

  /**
   * Resolves an import with its real importer and ensures configured targets are
   * analyzed under the final resolved identity.
   * @param importPath Import specifier from the importer source.
   * @param importer Importer id.
   */
  public async resolveEntryImport(importPath: string, importer: string) {
    const resolvedPath = await this.resolve(importPath, importer);
    if (!resolvedPath) return;

    if (this.entries.has(resolvedPath)) return resolvedPath;
    if (!(await this.isResolvedTargetImport(importPath, importer, resolvedPath))) return;

    this.logger.info(`Adding importer-resolved target "${importPath}" as "${resolvedPath}"`);
    this.targets.set(resolvedPath, 0);
    await EntryAnalyzer.analyzeEntry(this, resolvedPath, 0);
    this.watcher?.add(resolvedPath);

    return this.entries.has(resolvedPath) ? resolvedPath : undefined;
  }

  private async isResolvedTargetImport(importPath: string, importer: string, resolvedPath: string) {
    if (this.isTargetSpecifier(importPath)) return true;

    for (const targetSpecifier of this.targetSpecifiers) {
      const resolvedTarget = await this.resolve(targetSpecifier, importer);
      if (resolvedTarget === resolvedPath) return true;
    }

    return false;
  }

  private isTargetSpecifier(importPath: string) {
    const normalizedImport = this.normalizeId(importPath);

    for (const targetSpecifier of this.targetSpecifiers) {
      if (targetSpecifier === importPath || this.normalizeId(targetSpecifier) === normalizedImport) {
        return true;
      }
    }

    return false;
  }

  /**
   * Loads a file from the entries.
   * @param id Path to the file.
   */
  public loadFile(id: string) {
    const { url, serveSource } = parseId(id);
    const entryId = this.normalizeId(url);
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

  /**
   * Checks if hot update matches any of the entries.
   * If it does, re-triggers the analysis of that entry.
   * @param id Path to the file.
   */
  public async checkUpdate(id: string) {
    const entryId = normalizePath(parseId(id).url);
    const entryFile = this.entries.get(entryId);

    if (entryFile) {
      this.logger.info(`HMR requires new analysis of ${entryId}`);
      await EntryAnalyzer.doAnalyzeEntry(this, entryId, entryFile.depth);
      return true;
    }

    return false;
  }

  /**
   * Returns Vite module ids that can be served for an entry file.
   * @param id Path to the changed entry file.
   */
  public getHotUpdateModuleIds(id: string) {
    const entryId = normalizePath(parseId(id).url);

    if (!this.entries.has(entryId)) return [];

    return [entryId, addSourceQuerySuffix(entryId)];
  }

  /**
   * Collects the entry modules that should be invalidated after an HMR update.
   * @param id Path to the changed entry file.
   * @param modules Modules Vite already associated to the changed file.
   * @param moduleGraph Vite's module graph.
   */
  public getHotUpdateModules(
    id: string,
    modules: ModuleNode[],
    moduleGraph: Pick<ModuleGraph, 'getModuleById' | 'getModulesByFile'>,
  ) {
    const affectedModules = new Set<ModuleNode>();
    const moduleIds = this.getHotUpdateModuleIds(id);
    const entryId = moduleIds[0];
    const servedModuleIds = new Set(moduleIds);

    if (!entryId) return [];

    const addModule = (module?: ModuleNode) => {
      if (module && this.isServedEntryModule(module, entryId, servedModuleIds)) {
        affectedModules.add(module);
      }
    };
    const addImporterModule = (module?: ModuleNode) => {
      if (module) affectedModules.add(module);
    };

    modules.forEach(addModule);
    moduleGraph.getModulesByFile(entryId)?.forEach(addModule);
    moduleIds.forEach((moduleId) => {
      addModule(moduleGraph.getModuleById(moduleId));
    });
    this.getEntryImporterIds(entryId).forEach((moduleId) => {
      addImporterModule(moduleGraph.getModuleById(moduleId));
    });

    return [...affectedModules];
  }

  /**
   * Registers which entries were used to transform an importer.
   * @param importerId Resolved id of the transformed file.
   * @param entryIds Resolved ids of the imported entries.
   */
  public registerEntryImporter(importerId: string, entryIds: EntryPath[]) {
    const normalizedImporterId = normalizePath(importerId);
    this.unregisterEntryImporter(normalizedImporterId);

    entryIds.forEach((entryId) => {
      const normalizedEntryId = normalizePath(parseId(entryId).url);
      if (!this.entries.has(normalizedEntryId)) return;

      const importers = this.entryImporters.get(normalizedEntryId) ?? new Set<string>();
      importers.add(normalizedImporterId);
      this.entryImporters.set(normalizedEntryId, importers);
    });
  }

  /**
   * Removes stale transformed-importer references.
   * @param importerId Resolved id of a transformed file.
   */
  public unregisterEntryImporter(importerId: string) {
    const normalizedImporterId = normalizePath(importerId);

    this.entryImporters.forEach((importers, entryId) => {
      importers.delete(normalizedImporterId);
      if (!importers.size) this.entryImporters.delete(entryId);
    });
  }

  /** Ensures Vite's dev watcher does not ignore registered entry files. */
  public includeEntriesInWatcherOptions() {
    const serverConfig = (this.config as { server?: ResolvedConfig['server'] }).server;
    const watchOptions = serverConfig?.watch;
    if (!watchOptions) return;

    const ignored = watchOptions.ignored;
    const ignoredList = Array.isArray(ignored) ? ignored : ignored ? [ignored] : [];
    watchOptions.ignored = [...this.getEntryWatchIgnoreExceptions(), ...ignoredList];
  }

  /**
   * Adds registered entry files to Vite's dev watcher.
   * @param watcher Vite's dev server watcher.
   */
  public watchEntryFiles(watcher: Pick<FSWatcher, 'add'>) {
    this.watcher = watcher;
    const entryIds = [...this.entries.keys()];
    if (!entryIds.length) return;

    this.logger.info(`Watching ${entryIds.length} entry file(s) for HMR`);
    watcher.add(entryIds);
  }

  /** Registers targets from the plugin options. */
  private async registerTargets() {
    const paths = await Utils.getAllTargetPaths(this.options.targets);
    const targets: ExtendedTargets = new Map();

    await Utils.parallelize(paths, async (path) => {
      this.targetSpecifiers.add(path);
      const resolvedPath = (await this.resolve(path)) ?? this.normalizeId(path);
      this.logger.debug(`Registered target "${path}" as "${resolvedPath}"`);
      targets.set(resolvedPath, 0);
    });

    this.targets = targets;
  }

  /** Determines whether a Vite module is one of the entry modules served by this plugin. */
  private isServedEntryModule(module: ModuleNode, entryId: string, servedModuleIds: Set<string>) {
    if (!module.id) {
      return module.file ? normalizePath(module.file) === entryId : false;
    }

    const moduleId = normalizePath(module.id);
    if (servedModuleIds.has(moduleId)) return true;

    const parsed = parseId(moduleId);
    return parsed.url === entryId && parsed.serveSource;
  }

  /** Returns negative ignored patterns for entry files watched explicitly by this plugin. */
  private getEntryWatchIgnoreExceptions() {
    return [...this.entries.keys()].map((entryId) => `!${entryId}`);
  }

  /** Returns transformed importer ids that depended on the given entry analysis. */
  private getEntryImporterIds(entryId: EntryPath) {
    return [...(this.entryImporters.get(entryId) ?? [])];
  }
}
