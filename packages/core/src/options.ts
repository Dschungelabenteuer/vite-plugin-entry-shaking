import { normalizePath } from 'vite';
import type { FinalPluginOptions, PluginOptions } from './types';

/** Default `extensions` option value. */
export const extensions = ['js', 'mjs', 'ts', 'mts'];

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
  targets: userOptions.targets.map(normalizePath),
});
