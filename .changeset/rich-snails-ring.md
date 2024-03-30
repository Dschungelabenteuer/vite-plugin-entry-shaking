---
'vite-plugin-entry-shaking': minor
---

### Features

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
