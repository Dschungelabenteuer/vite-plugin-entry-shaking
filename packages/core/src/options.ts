import { normalizePath } from 'vite';
import type { DiagnosticsConfig, FinalPluginOptions, PluginOptions } from './types';
import { isObjectDefinition } from './utils';

/** Default `extensions` option value. */
export const extensions = ['js', 'mjs', 'ts', 'mts'];

/** Default `ignorePatterns` option value. */
const ignorePatterns = [/node_modules/];

/** Default plugin options. */
export const defaultOptions: FinalPluginOptions = {
  targets: [],
  extensions,
  ignorePatterns,
  debug: false,
  maxWildcardDepth: 0,
  diagnostics: {
    definedWithinEntry: true,
    maxDepthReached: true,
  },
};

/**
 * Merges user options with the default ones.
 * @param userOptions Options passed to the plugin by the user.
 */
export const mergeOptions = (userOptions: PluginOptions): FinalPluginOptions => ({
  ...defaultOptions,
  ...userOptions,
  ignorePatterns: mergeIgnorePatterns(userOptions),
  diagnostics: setDiagnosticsOption(userOptions),
  maxWildcardDepth: userOptions.maxWildcardDepth ?? 0,
  targets: userOptions.targets.map((target) => {
    if (typeof target === 'string') return normalizePath(target);
    if (isObjectDefinition(target)) return normalizePath(target.path);
    return target;
  }),
});

/**
 * Merges user "ignorePatterns" option with the default one.
 * @param userOptions Options passed to the plugin by the user.
 */
const mergeIgnorePatterns = (userOptions: PluginOptions): RegExp[] => [
  ...defaultOptions.ignorePatterns,
  ...(userOptions.ignorePatterns ?? []),
];

/**
 * Creates the final "diagnostics" option.
 * @param userOptions Options passed to the plugin by the user.
 */
const setDiagnosticsOption = (userOptions: PluginOptions): DiagnosticsConfig => {
  const { diagnostics } = defaultOptions;
  const keys = Object.keys(diagnostics);
  const setAll = (v: boolean) => keys.reduce((out, k) => ({ ...out, [k]: v }), {});

  switch (userOptions.diagnostics) {
    case undefined:
      return diagnostics;
    case true:
      return setAll(true);
    case false:
      return setAll(false);
    default:
      return { ...diagnostics, ...userOptions.diagnostics };
  }
};
