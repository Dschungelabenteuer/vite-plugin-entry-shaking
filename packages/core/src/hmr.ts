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

  /** Vite's dev server watcher. */
  private watcher?: Pick<FSWatcher, 'add'>;

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
    const serverConfig = (this.context.config as { server?: ResolvedConfig['server'] }).server;
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
    const entryIds = [...this.context.entries.keys()];
    if (!entryIds.length) return;

    this.context.logger.info(`Watching ${entryIds.length} entry file(s) for HMR`);
    watcher.add(entryIds);
  }

  /**
   * Adds an entry discovered after server configuration to Vite's watcher.
   * @param entryId Resolved entry id.
   */
  public watchEntryFile(entryId: EntryPath) {
    this.watcher?.add(entryId);
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
    return [...this.context.entries.keys()].map((entryId) => `!${entryId}`);
  }

  /** Returns transformed importer ids that depended on the given entry analysis. */
  private getEntryImporterIds(entryId: EntryPath) {
    return [...(this.entryImporters.get(entryId) ?? [])];
  }
}
