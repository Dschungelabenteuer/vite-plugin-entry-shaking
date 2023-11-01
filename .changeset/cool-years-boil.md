---
'vite-plugin-entry-shaking': patch
---

Fixed an issue where wildcard imports would break instead of be ignored. This led to further
considerations about some edge cases wildcard imports could cause. See
[this example](./examples/issue-29/src/main.ts) for further information.
