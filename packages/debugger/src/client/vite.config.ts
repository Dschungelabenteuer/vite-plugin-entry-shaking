import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dev from './dev.plugin';

const outDir = '../../dist/client';

export default defineConfig({
  base: './',
  build: { outDir },
  plugins: [vue(), dev()],
  resolve: {
    alias: {
      '#store': fileURLToPath(new URL('./store.ts', import.meta.url)),
      '#utils': fileURLToPath(new URL('./utils.ts', import.meta.url)),
      '#types': fileURLToPath(new URL('./types.ts', import.meta.url)),
      '@assets': fileURLToPath(new URL('./assets', import.meta.url)),
      '@component': fileURLToPath(new URL('./components', import.meta.url)),
      '@composable': fileURLToPath(new URL('./composables', import.meta.url)),
      '@helpers': fileURLToPath(new URL('./helpers', import.meta.url)),
      '@views': fileURLToPath(new URL('./views', import.meta.url)),
      '@pages': fileURLToPath(new URL('./pages', import.meta.url)),
      '@styles': fileURLToPath(new URL('./styles', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { additionalData: `@import "@styles/global.scss";` },
    },
  },
});
