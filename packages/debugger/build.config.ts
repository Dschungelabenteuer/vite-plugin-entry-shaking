import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: false,
  entries: ['src/index'],
  declaration: true,
  externals: ['vite', 'vite-plugin-entry-shaking'],
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    dts: { respectExternal: true },
    output: { exports: 'named' },
  },
});
