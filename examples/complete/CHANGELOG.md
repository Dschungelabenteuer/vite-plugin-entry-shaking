# vite-plugin-entry-shaking-example-complete

## 0.1.0

### Minor Changes

- 8fee575: - Replaced the "include" option with a simpler "exclude" option. This should help avoid performance issues that could be caused by globby matching huge amounts of paths.
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
