import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    includeSource: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'istanbul',
      exclude: ['src/index.ts'],
    },
  },
});
