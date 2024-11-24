import { defineConfig } from 'vite';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(() => ({
  plugins: [
    EntryShakingPlugin({
      targets: [
        {
          //
          glob: 'src/utils/index.ts',
        },
      ],
      debug: true,
    }),
    vue(),
  ],
}));
