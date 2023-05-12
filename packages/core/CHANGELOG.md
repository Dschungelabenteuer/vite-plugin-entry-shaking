# vite-plugin-entry-shaking

## 0.2.1

### Patch Changes

- 15a67f9: Fixed regex to support multiline imports

## 0.2.0

### Minor Changes

- ea9fd1a:

  #### New features

  - Added HMR support for the entry points. In previous releases, when editing one of the consumed
    entry points, you would need to restart the dev server to re-run the plugin analyzis and
    cleanups of entry points. Editing any entry point will now automatically re-trigger its analyzis
    and cleanup, and following served files should be served accordingly.

  #### Governance

  - Bumped Vite's reference version to 4.0.1
  - Copied README to core package so that it is correctly displayed on npm.
  - Refactored the code to improve maintainability and tests.
  - Removed custom resolver to make use of Vite's
    [own resolver](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L544)
    instead. This should improve consistency and plugin's maintainance by delegating the _resolve
    logic_ to Vite.

  #### Bug fixes

  - Fixed a bug which caused served app to crash when using aliases to import named entities from
    entry point (e.g. `import { A_MODULE_B as B } from 'path/to/entry'`). The bug being fixed, you
    should also be able to import the same entities twice using aliases (e.g.
    `import { A_MODULE_B, A_MODULE_B as B } from 'path/to/entry'`).

## 0.1.0

### Minor Changes

- 8fee575: - Replaced the "include" option with a simpler "exclude" option. This should help avoid
  performance issues that could be caused by globby matching huge amounts of paths.
  - Removed the `root` option which is not used anymore after the above change

## 0.0.3

### Patch Changes

- c0641df:
  - Fixed the plugin not correctly rewriting imports of aliases
  - Fixed the plugin being used in build mode (#1)
  - Added Node minimal requirements

## 0.0.2

### Patch Changes

- a7e8fe2: Prepare release (v0.0.2)

## 0.0.1

### Patch Changes

- 527b746: Prepare release (v0.0.1)
