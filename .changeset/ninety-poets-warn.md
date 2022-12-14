---
"vite-plugin-entry-shaking-example-complete": minor
"vite-plugin-entry-shaking-example-simple": minor
"vite-plugin-entry-shaking": minor
---

## New features
- Added HMR support for the entry points. In previous releases, when editing one of the consumed entry points, you would need to restart the dev server to re-run the plugin analyzis and cleanups of entry points. Editing any entry point will now automatically re-trigger its analyzis and cleanup, and following served files should be served accordingly.

## Governance
- Bumped Vite's reference version to 4.0.1
- Copied README to core package so that it is correctly displayed on npm.
- Refactored the code to improve maintainability and tests.
- Removed custom resolver to make use of Vite's [own resolver](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L544) instead. This should improve consistency and plugin's maintainance by delegating the _resolve logic_ to Vite.

## Bug fixes
- Fixed a bug which caused served app to crash when using aliases to import named entities from entry point (e.g. `import { A_MODULE_B as B } from 'path/to/entry'`). The bug being fixed, you should also be able to import the same entities twice using aliases (e.g. `import { A_MODULE_B, A_MODULE_B as B } from 'path/to/entry'`).