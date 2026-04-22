---
'vite-plugin-entry-shaking': patch
---

Fixed HMR for registered entry files by watching analyzed entries, re-analyzing changed entries, and invalidating transformed importers that depended on stale entry analysis.
