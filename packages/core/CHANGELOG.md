# vite-plugin-entry-shaking

## 0.4.0

### Minor Changes

- 67233cb: ### Features

  - Refined logger and added some websocket messages to extend debugging/benchmarking abilities
  - Added an experimental debugger application
  - Added an example generator CLI for easier repros
  - Added support for wilcard imports analysis (fixes #34)
  - Added support for target's default export (this limitation was not known/documented and found with
    updated tests)
  - Added glob patterns support for "targets" option (thanks
    [moushicheng](https://github.com/moushicheng))

  ### Chore

  - Created some kind of logo, please don't hate I'm not a designer
  - Revamped examples with a simple webapp that one can use to test and debug this plugin against
    use-cases
  - Reworked tests to get even more coverage and confidence
  - Made names more consistent with options and docs (especially entry -> target)
  - Updated dependencies

  ### Fixes

  - Fixed an issue when re-exporting aliased entity (fixes #28, thanks
    [fdc-viktor-luft](https://github.com/fdc-viktor-luft) for reporting & investigating)
  - Fixed an issue with multiline imports/exports (fixes #35, thanks
    [mx-bernhard](https://github.com/mx-bernhard) for reporting & contributing)
  - Fixed an issue where if a target was default exporting something, importing that default export
    would probably result in error.

## 0.3.3

### Patch Changes

- e0f268e: Fixed an issue where wildcard imports would break instead of be ignored. This led to
  further considerations about some edge cases wildcard imports could cause. See
  [this example](./examples/issue-29/src/main.ts) for further information.
- e0f268e: Updated dependencies and fixed dependabot alerts

## 0.3.2

### Patch Changes

- f4abe88: Fixed misalignment between source entry file content and their mutated versions

## 0.3.1

### Patch Changes

- dc07179: Fixed postinstall script location

## 0.3.0

### Minor Changes

- 963b45a: Added support for circular imports/exports accross target entries

### Patch Changes

- d2147c0: Added a message to clarify which entry file throws an error when being analyzed
- 977b17c: Export plugin as named export

## 0.2.1

### Patch Changes

- 15a67f9: Fixed regex to support multiline imports

## 0.2.0

### Minor Changes

- ea9fd1a:

  #### New features

  - Added HMR support for the entry points. In previous releases, when editing one of the consumed
    entry points, you would need to restart the dev server to re-run the plugin analysis and
    cleanups of entry points. Editing any entry point will now automatically re-trigger its analysis
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
