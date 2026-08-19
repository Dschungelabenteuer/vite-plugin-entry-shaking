# vite-plugin-entry-shaking-debugger

## 2.1.0

### Minor Changes

- 8030a20: <!--

  ## Governance
  - Switched from eslint to sxlint
  - Switched from biome to oxfmt
  - Started using pnpm catalogs for dep management
  - Upgraded to Vite 8 and from unbuild to obuild (rolldown support)
  - Upgraded other dependencies and devDependencies
  - Upgraded github actions and added a typecheck action
  - Created a `vue-component-library` example that includes a generator to create a large component library with a barrel export file so that we can later benchmark this plugin's performances against Vite 8.2.2's stable bundledDev option.

  ## Tests
  - Fixed some test that became flaky due to Vite 8 changes.
    -->

  ## Core
  - Dropped CJS support, it is now ESM only.
  - This plugin is now tested against Vite 8+ codebases, older Vite versions are not guaranteed to be supported.
  - This plugin now uses `tinyglobby` instead of `fast-glob` to keep in line with Vite's [own switch](https://github.com/vitejs/vite/issues/18243).

  ## Debugger
  - Switched from shiki to codemirror to show code snipppets and diffs.
  - Fixed some issues with diffs calculation.
  - Fixed context's transforms propagation from ViteDevServer to debugger client.

### Patch Changes

- Updated dependencies [816136f]
- Updated dependencies [69dd544]
- Updated dependencies [8030a20]
  - vite-plugin-entry-shaking@0.6.0

## 2.0.2

### Patch Changes

- Updated dependencies [22febdf]
  - vite-plugin-entry-shaking@0.5.2

## 2.0.1

### Patch Changes

- Updated dependencies [8d06211]
  - vite-plugin-entry-shaking@0.5.1

## 2.0.0

### Minor Changes

- 859c28e: Bumped minor version

### Patch Changes

- cb7ecfe: Updated dependencies
- 20b7981: Fixed cross-entry wildcard import issue
- Updated dependencies [cb7ecfe]
- Updated dependencies [cb7ecfe]
- Updated dependencies [859c28e]
- Updated dependencies [20b7981]
  - vite-plugin-entry-shaking@0.5.0

## 1.0.3

### Patch Changes

- Updated dependencies [7c205c8]
  - vite-plugin-entry-shaking@0.4.3

## 1.0.2

### Patch Changes

- Updated dependencies [713383a]
  - vite-plugin-entry-shaking@0.4.2

## 1.0.1

### Patch Changes

- 8698cf6: Added build script to changeset action
  - vite-plugin-entry-shaking@0.4.1

## 1.0.0

### Patch Changes

- Updated dependencies [67233cb]
  - vite-plugin-entry-shaking@0.4.0
