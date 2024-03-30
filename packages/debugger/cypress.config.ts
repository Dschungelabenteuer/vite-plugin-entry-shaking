import { defineConfig } from 'cypress';
import viteConfig from './src/client/vite.config';

export default defineConfig({
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
      viteConfig,
    },
  },
  e2e: {
    specPattern: '**/*.spec.ts',
    setupNodeEvents(_on, _config) {},
  },
});
