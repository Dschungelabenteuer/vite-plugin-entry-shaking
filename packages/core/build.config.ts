import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  entries: ['./src/index', './src/serializer'],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
