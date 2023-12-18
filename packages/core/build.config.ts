import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  entries: ['./src/index'],
  declaration: true,
  externals: ['vite', 'vite-plugin-entry-shaking-debugger'],
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    dts: { respectExternal: true },
  },
});
