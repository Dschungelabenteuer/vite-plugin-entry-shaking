---
"vite-plugin-entry-shaking": patch
---

Preserve the local alias of named imports that cannot be resolved to a concrete file (e.g. symbols reached through an `export *` re-export chain). Previously the alias was dropped when such an import fell back to being left on the target entry, so `import { X as Y }` was rewritten to `import { X }` while the module body still referenced `Y` — producing an undefined reference, or a duplicate-identifier crash when another `X` binding existed in the same module.
