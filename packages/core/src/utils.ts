import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { EntryPath, EntryTarget, TargetGlobPattern, TargetObject } from './types';
import { transformJsx, transformTs } from './transform';
import { extname } from 'path';

export type Parallel = <T extends any[]>(items: T, cb: ParallelCb<T>) => Promise<any[] | void>;
export type ParallelCb<T> = (
  item: T extends (infer A)[] ? A : never,
  index: number,
  array: any[],
) => Promise<any>;

/** Runs multiple promises in parallel. */
export const parallelize: Parallel = async (a, cb) => Promise.all(a.map(cb));

/** Loads plugin's event bus. */
export const loadEventBus = async () => await import('./event-bus');

/** Loads plugin's debugger. */
export const loadDebugger = async () => {
  const debuggerPkgName = 'vite-plugin-entry-shaking-debugger';
  try {
    const debuggerPkg = await import(debuggerPkgName);
    return debuggerPkg;
  } catch {
    throw new Error(`Using the \`debug\` option requires installing \`${debuggerPkgName}\``);
  }
};

/**
 * Returns paths to targets.
 * Supports either strings or glob patterns.
 */
export const getAllTargetPaths = async (targets: EntryTarget[]) => {
  const paths: EntryPath[] = [];
  for (const target of targets) {
    if (typeof target === 'string') paths.push(target);
    else if (isObjectDefinition(target)) paths.push(target.path);
    else if (isGlobPatternDefinition(target)) {
      const { glob, globOptions } = target;
      const globSync = await loadFastGlob();
      const options = { ignore: ['**/node_modules/**'], ...(globOptions ?? {}) };
      const matches = globSync(glob, options).map((path) => path);

      paths.push(...matches);
    } else {
      throw new Error('Invalid target definition.');
    }
  }

  return paths;
};

export const getCodeFromPath = async (path: string) => {
  const code = readFileSync(resolve(path), 'utf-8');
  return code;
};

const loadFastGlob = async () => {
  const {
    default: { globSync },
  } = await import('fast-glob').catch(() => {
    throw new Error('Could not find fast-glob');
  });
  return globSync;
};

export const isObjectDefinition = (target: EntryTarget): target is TargetObject =>
  typeof target === 'object' && 'path' in target;

export const isGlobPatternDefinition = (target: EntryTarget): target is TargetGlobPattern =>
  typeof target === 'object' && 'glob' in target;

export default {
  parallelize,
  loadEventBus,
  loadDebugger,
  getAllTargetPaths,
  isObjectDefinition,
  isGlobPatternDefinition,
};
