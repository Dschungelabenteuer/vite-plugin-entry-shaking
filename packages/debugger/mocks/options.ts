import type { Context } from 'vite-plugin-entry-shaking';

export const options: Partial<Context['options']> = {
  debug: false,
  diagnostics: {
    definedWithinEntry: true,
    maxDepthReached: true,
  },
  maxWildcardDepth: 1,
};
