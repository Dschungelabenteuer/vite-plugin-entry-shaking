import type { FSWatcher, ModuleGraph, ModuleNode, ResolvedConfig } from 'vite';
import { normalizePath } from 'vite';
import EntryAnalyzer from './analyze-entry';
import type { Context } from './context';
import type { EntryPath } from './types';
import { addSourceQuerySuffix, parseId } from './urls';

/** Plugin's HMR utilities. */
export class HMR {
  /** Map of transformed importers indexed by the entry files they imported. */
  public entryImporters = new Map<EntryPath, Set<string>>();

  /** Entry files registered for explicit watching. */
  private watchedEntries = new Set<EntryPath>();

  /** Vite's dev server watcher. */
  private watcher?: Pick<FSWatcher, 'add' | 'options'>;

  constructor(private context: Context) {}

  /**
   * Checks if a hot update matches any of the entries.
   * If it does, re-triggers the analysis of that entry.
   * @param id Path to the file.
   */
  public async checkUpdate(id: string) {
    const entryId = normalizePath(parseId(id).url);
    const entryFile = this.context.entries.get(entryId);

    if (entryFile) {
      this.context.logger.info(`HMR requires new analysis of ${entryId}`);
      await EntryAnalyzer.doAnalyzeEntry(this.context, entryId, entryFile.depth);
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

    if (!this.context.entries.has(entryId)) return [];

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
   * @param importerId Resolved id of a transformed file.
   * @param entryIds Resolved ids of the imported entries.
   */
  public registerEntryImporter(importerId: string, entryIds: EntryPath[]) {
    const normalizedImporterId = normalizePath(importerId);
    this.unregisterEntryImporter(normalizedImporterId);

    entryIds.forEach((entryId) => {
      const normalizedEntryId = normalizePath(parseId(entryId).url);
      if (!this.context.entries.has(normalizedEntryId)) return;

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
    const watchOptions = this.getWatchOptions();
    if (!watchOptions) return;

    const ignored = watchOptions.ignored;
    const ignoredList = Array.isArray(ignored) ? ignored : ignored ? [ignored] : [];
    const exceptions = this.getEntryWatchIgnoreExceptions();
    const exceptionSet = new Set(exceptions);
    watchOptions.ignored = [
      ...exceptions,
      ...ignoredList.filter((pattern) => typeof pattern !== 'string' || !exceptionSet.has(pattern)),
    ];
  }

  /**
   * Adds registered entry files to Vite's dev watcher.
   * @param watcher Vite's dev server watcher.
   */
  public watchEntryFiles(watcher: Pick<FSWatcher, 'add' | 'options'>) {
    this.watcher = watcher;
    const entryIds = [...new Set([...this.context.entries.keys(), ...this.watchedEntries])].map(
      (entryId) => this.registerEntryForWatching(entryId),
    );
    if (!entryIds.length) return;

    this.context.logger.info(`Watching ${entryIds.length} entry file(s) for HMR`);
    watcher.add(entryIds);
  }

  /**
   * Adds an entry discovered after server configuration to Vite's watcher.
   * @param entryId Resolved entry id.
   */
  public watchEntryFile(entryId: EntryPath) {
    const normalizedEntryId = this.registerEntryForWatching(entryId);
    this.watcher?.add(normalizedEntryId);
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
    return [...new Set([...this.context.entries.keys(), ...this.watchedEntries])].map(
      (entryId) => `!${entryId}`,
    );
  }

  /** Registers an entry with the live watcher keep policy. */
  private registerEntryForWatching(entryId: EntryPath) {
    const normalizedEntryId = normalizePath(parseId(entryId).url);
    this.watchedEntries.add(normalizedEntryId);
    this.addEntryWatchIgnoreException(normalizedEntryId);
    return normalizedEntryId;
  }

  /** Adds an entry exception to the configured and active watcher options. */
  private addEntryWatchIgnoreException(entryId: EntryPath) {
    const exception = `!${entryId}`;
    const watchOptions = this.getWatchOptions();

    if (watchOptions) {
      const ignored = watchOptions.ignored;
      const ignoredList = Array.isArray(ignored) ? ignored : ignored ? [ignored] : [];
      if (!ignoredList.includes(exception)) {
        watchOptions.ignored = [exception, ...ignoredList];
      }
    }

    const activeIgnored = this.watcher?.options.ignored;
    if (Array.isArray(activeIgnored) && !activeIgnored.includes(exception)) {
      activeIgnored.unshift(exception);
    }
  }

  /** Returns Vite's configured watcher options when file watching is enabled. */
  private getWatchOptions() {
    const serverConfig = (this.context.config as { server?: ResolvedConfig['server'] }).server;
    if (!serverConfig || serverConfig.watch === null) return;

    return (serverConfig.watch ??= {});
  }

  /** Returns transformed importer ids that depended on the given entry analysis. */
  private getEntryImporterIds(entryId: EntryPath) {
    return [...(this.entryImporters.get(entryId) ?? [])];
  }
}
