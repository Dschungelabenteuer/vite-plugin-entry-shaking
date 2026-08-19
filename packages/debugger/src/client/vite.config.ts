import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dev from './dev.plugin.ts';

const outDir = '../../dist/client';

const _ = (relPath: string) => fileURLToPath(new URL(relPath, import.meta.url));

export default defineConfig({
  base: './',
  build: { outDir, emptyOutDir: true },
  plugins: [vue(), dev()],
  devtools: { enabled: false },
  resolve: {
    // still not resolving client-side as root !== client
    tsconfigPaths: true,
    alias: {
      $storybook: _('../../.storybook'),
      '#store': _('./store.ts'),
      '#utils': _('./utils.ts'),
      '#types': _('../../types.ts'),
      '#uitypes': _('./types.ts'),
      '@assets': _('./assets'),
      '@components': _('./components'),
      '@composables': _('./composables'),
      '@helpers': _('./helpers'),
      '@layout': _('./layout'),
      '@views': _('./views'),
      '@pages': _('./pages'),
      '@styles': _('./styles'),
      '@workers': _('./workers'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "/styles/_mixins.scss" as *;\n@use "/styles/_variables.scss" as *;`,
      },
    },
  },
});
