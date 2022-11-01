---
"vite-plugin-entry-shaking-example-complete": minor
"vite-plugin-entry-shaking-example-simple": minor
"vite-plugin-entry-shaking": minor
---

- Replaced the "include" option with a simpler "exclude" option. This should help avoid performance issues that could be caused by globby matching huge amounts of paths.
- Removed the `root` option which is not used anymore after the above change
