import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // silent: true,
    includeSource: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'istanbul',
      exclude: ['src/index.ts', 'src/logger.ts'],
    },
  },
});
