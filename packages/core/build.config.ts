import { defineBuildConfig } from 'obuild/config';

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index'],
      dts: true,
      minify: true,
      rolldown: {
        external: ['vite', 'vite-plugin-entry-shaking-debugger', 'fast-glob', 'esbuild'],
      },
    },
  ],
  // clean: true,
  // entries: ['./src/index'],
  // declaration: true,
  // externals: ['vite', 'vite-plugin-entry-shaking-debugger', 'fast-glob', 'esbuild'],
  // rollup: { output: { exports: 'named' }, emitCJS: true, inlineDependencies: true },
});
