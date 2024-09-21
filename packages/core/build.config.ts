import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  entries: ['./src/index'],
  declaration: true,
  externals: ['vite', 'vite-plugin-entry-shaking-debugger', 'fast-glob', 'esbuild'],
  rollup: {
    output: { exports: 'named' },
    emitCJS: true,
    inlineDependencies: true,
    dts: { respectExternal: true },
  },
});
