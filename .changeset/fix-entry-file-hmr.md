---
'vite-plugin-entry-shaking': minor
---

Fixed HMR for registered entry files by watching analyzed entries, re-analyzing changed entries, and invalidating transformed importers that depended on stale entry analysis.

Fixed dev-server import rewrites when another Vite plugin remaps imports in `resolveId`, including package-entry and concrete-file remaps. Entry analysis and import matching now use final resolved ids from Vite's plugin container, and default alias re-exports remain available through wildcard entry chains.
