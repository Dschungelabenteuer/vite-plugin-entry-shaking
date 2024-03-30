import { normalizePath } from 'vite';
import type { EntryTarget, FinalPluginOptions, PluginOptions } from './types';

/** Default `extensions` option value. */
const extensions = ['js', 'jsx', 'mjs', 'ts', 'tsx', 'mts'];

/** Default `ignorePatterns` option value. */
const ignorePatterns = [/node_modules/];

/**
 * Merges user options with the default ones.
 * @param userOptions Options passed to the plugin by the user.
 */
export const mergeOptions = (userOptions: PluginOptions): FinalPluginOptions => ({
  extensions,
  ignorePatterns: [...ignorePatterns, ...(userOptions.ignorePatterns ?? [])],
  debug: false,
  ...userOptions,
  targets: userOptions.targets.map((target: EntryTarget) => {
    if (typeof target === 'string') return normalizePath(target);
    if (target.path) {
      target.path = normalizePath(target.path);
    }
    return target;
  }),
});
