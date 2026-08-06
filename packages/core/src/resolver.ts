import type { ResolveFn, ViteDevServer } from 'vite';
import { normalizePath } from 'vite';
import EntryAnalyzer from './analyze-entry';
import type { Context } from './context';
import type { EntryPath, ExtendedTargets } from './types';
import { parseId } from './urls';
import Utils from './utils';

/** Plugin's module resolution utilities. */
export class Resolver {
  /** Target ids exactly as configured before importer-specific resolution. */
  private targetSpecifiers = new Set<EntryPath>();

  constructor(
    private context: Context,
    private resolveFn: ResolveFn,
  ) {}

  /**
   * Uses Vite's final plugin container for module resolution when available.
   * @param server Vite's development server.
   */
  public usePluginContainer(server: Partial<ViteDevServer>) {
    const { pluginContainer } = server;
    if (!pluginContainer) return;

    const fallbackResolver = this.resolveFn;
    this.resolveFn = async (id, importer, aliasOnly, ssr) => {
      if (aliasOnly) return await fallbackResolver(id, importer, aliasOnly, ssr);

      const resolved = await pluginContainer.resolveId(id, importer, { ssr });
      if (resolved) return typeof resolved === 'string' ? resolved : resolved.id;

      return await fallbackResolver(id, importer, aliasOnly, ssr);
    };
  }

  /**
   * Resolves and normalizes a module id through the active Vite resolver.
   * @param id Imported id/specifier.
   * @param importer Importer id.
   * @param aliasOnly Whether only aliases should be resolved.
   * @param ssr Whether the resolution is for SSR.
   */
  public async resolve(id: string, importer?: string, aliasOnly?: boolean, ssr?: boolean) {
    const resolved = await this.resolveFn(id, importer, aliasOnly, ssr);
    return resolved ? this.normalizeId(resolved) : undefined;
  }

  /**
   * Normalizes a module id before using it as a target/entry cache key.
   * @param id Module id.
   */
  public normalizeId(id: string) {
    return normalizePath(parseId(id).url);
  }

  /** Resolves and registers targets from the plugin options. */
  public async registerTargets() {
    const paths = await Utils.getAllTargetPaths(this.context.options.targets);
    const targets: ExtendedTargets = new Map();
    this.targetSpecifiers.clear();

    await Utils.parallelize(paths, async (path) => {
      this.targetSpecifiers.add(path);
      const resolvedPath = (await this.resolve(path)) ?? this.normalizeId(path);
      this.context.logger.debug(`Registered target "${path}" as "${resolvedPath}"`);
      targets.set(resolvedPath, 0);
    });

    this.context.targets = targets;
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

    if (this.context.entries.has(resolvedPath)) return resolvedPath;
    if (!(await this.isResolvedTargetImport(importPath, importer, resolvedPath))) return;

    this.context.logger.info(
      `Adding importer-resolved target "${importPath}" as "${resolvedPath}"`,
    );
    this.context.targets.set(resolvedPath, 0);
    await EntryAnalyzer.analyzeEntry(this.context, resolvedPath, 0);

    return this.context.entries.has(resolvedPath) ? resolvedPath : undefined;
  }

  private async isResolvedTargetImport(
    importPath: string,
    importer: string,
    resolvedPath: string,
  ) {
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
      if (
        targetSpecifier === importPath ||
        this.normalizeId(targetSpecifier) === normalizedImport
      ) {
        return true;
      }
    }

    return false;
  }
}
