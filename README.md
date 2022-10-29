<h1 align="center">vite-plugin-entry-shaking</h1>

<p align="center">
  Mimic tree-shaking behaviour when importing code from an entry file in development mode.
</p>

> **Warning**
>  This plugin is experimental, bugs might be expected and some edge cases might not be covered.

> **Note**
>  The main execution logic of this plugin only applies to development mode because it addresses an issue which is specific to development mode.

## Install

[![Open in Codeflow](https://developer.stackblitz.com/img/open_in_codeflow.svg)](https:///pr.new/Dschungelabenteuer/vite-plugin-entry-shaking)


```bash
# Using npm
npm i -D vite vite-plugin-entry-shaking
# Using Yarn
yarn add -D vite vite-plugin-entry-shaking
# Using pnpm
pnpm add -D vite vite-plugin-entry-shaking
```

## Usage

Setup the plugin in your Vite configuration file.

```ts
import { resolve } from 'path';
import { defineConfig } from 'vite';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';

export default defineConfig(async () => ({
  plugins: [
    await EntryShakingPlugin({
      targets: [resolve(__dirname, 'src/entry-a')],
    }),
  ],
}));
```

### Plugin options

> #### **targets:** `string[]` - _Array of absolute paths to target entry points._

You need to list all of the entry points you want this plugin to process.

> #### **(optional) extensions:** `string[]` - _Array of extensions that require transformations._

This specifies which file extensions you want this plugin to process.

Default value: `['js', 'jsx', 'mjs', 'ts', 'tsx', 'mts']`

> #### **(optional) root:** `string` - _Project's root directory._

Specifies the path to the project's root. Especially useful when using the plugin inside a monorepository which consumes workspace packages and when using package managers which do not hoist modules. The root path is relative to Vite config's `root` parameter.

Default value: `'.'`

> #### **(optional) include:** `string[]` - _Array of glob patterns._

This specifies glob patterns whose matched paths can be transformed by the plugin.
* These patterns are resolved based on the above `root` option.
* Hidden `.dot` files and folders (e.g. `.vscode`) are excluded by default.
* All of the `node_modules` folders are excluded by default.
* Everything else within the `root` directory is included by default.

Default value: `[]`

> #### **(optional) debug:** `boolean` - _Enable debug logs._

Turns on debug mode. This will print debug logs if Vite's `logLevel` is set to any other value than `'silent'`

Default value: `false`

## Motivation

The problem this plugin tries to address is well described by this [Vite's github issue](https://github.com/vitejs/vite/issues/8237), so we'll stick to its author's example. Suppose your codebase contains an index file which is basically used as an entry point to dispatch code imported from other files. This is a rather common pattern which may be handy and avoid writing a lot of individual import statements:

```ts
// shared/index.ts
export { a } from './a';
export { b } from './b';
export { c } from './c';
```

Let's pretend you have a module which imports `c` from that entry point:

```ts
// module.ts
import { c } from './shared';
```

In development mode, when Vite serves the `module.ts` file, the browser loads the `shared/index.ts` file which initiates requests for all of the three `a`, `b` and `c` modules it relies on. The thing is, we actually only needed the `c` module, this results in both `a` and `b` requests being unnecessary!

As your projet and entry points grow, you end up paying the price for the ever-increasing amount of unnecessary requests and HMR updates, which consumes time and resources. Well, that escalated quickly. Let's try to work around this…

## The idea

The main idea is to rewrite imports from a target entry point and replace them by individual imports of the actual module. Back with the above example:

```ts
// module.ts
import { c } from './shared';

// gets rewritten as…
import { c } from './shared/c';
```

This way, the `shared/index.ts` file is not loaded by the browser anymore and no additional requests are initiated.

## How it works

First of all, the plugin reads all of the target entry files listed in the plugin's `targets` option. For each entry file :
* It uses [`es-module-lexer`](https://github.com/guybedford/es-module-lexer) to get a list of imports and exports.
* It stores named exports that are re-exports of code imported from another module and the path they resolve to. It also stores whether this re-exported code is the default or a named export of its origin. This lets us correctly rewrite the import using the adequate statement.
* It also tracks a mutated version of the entry file where these stored named exports are removed. This is required because we might still import code which is actually defined within the entry file, rather than exported from another module. To make these work, we'll still need to serve this mutated version of the entry file so that this kind of code can be reached.

Whenever Vite serves a file which includes an import which resolved to one of the `targets`, this file is transformed to rewrite the relevant import statements. It extracts the list of entities imported from that entry file, and for each imported entity :
* it removes the import statement of that entry file.
* if it has a matching stored named export, it adds a direct import to the relevant module's absolute path, taking into consideration whether it imports a named export or a default export.
* If it has no matching stored named export, it is some code which is actually defined within the entry file. These are batched and eventually add a recomposed import of the target.

When encountering the above latest case, we have the browser still loading the `shared/index.ts`, which could therefore trigger unnecessary requests, as described earlier. To prevent this kind of scenario, any import of an entry point is caught and is forced to serve its mutated version we stored while parsing the entry point file. This ensures the entry point only imports what it needs to make the code it explicitly defines work.

## Limitations
* See `es-module-lexer`'s [own limitations](https://github.com/guybedford/es-module-lexer#limitations).
* The following syntaxes are not supported:
  * dynamic imports
  * `import json from './json.json' assert { type: 'json' }`
  * `import * as xxx from '…'`
  * `export * from '…'`