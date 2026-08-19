---
'vite-plugin-entry-shaking': minor
'vite-plugin-entry-shaking-debugger': minor
---

<!--
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
