<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/assets/16818271/85f20faf-0e76-4339-a703-0f4ef1252de9">
    <img src="https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/assets/16818271/6af66867-ffea-4f7d-9f56-3801ffd17659" alt="Vite-plugin-entry-shaking illustration" width="600" />
  </picture>
</p>

<h1 align="center">vite-plugin-entry-shaking</h1>

<p align="center">
  Mimic tree-shaking behaviour when importing code from an entry file in development mode.
</p>

> [!NOTE]
> The main execution logic of this plugin only applies to development mode because it
> addresses an issue which is specific to development mode. It _may_ be used in test environments that rely on Vite (e.g. Vitest) but should be used with caution as stated in [limitations](#limitations).

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

export default defineConfig({
  plugins: [
    EntryShakingPlugin({
      targets: [
        // Using direct paths.
        resolve(__dirname, 'src/entry-a')
        // Or using glob patterns.
        {
          glob: 'src/utils/*.ts',
          globOptions: { ignore: ['excluded.ts'] },
        }
      ],
    }),
  ],
});
```

### Plugin options

<table>
  <thead>
    <tr>
      <th>Option name</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>targets <em>(required)</em></td>
      <td>
        <ul>
       <li><code>string[]</code></li>
       <li><code>{ path: string }[]</code></li>
       <li><code>{ glob: string; globOptions: import('fast-glob').Options }[]</code></li>
        </ul>
      </td>
      <td>N/A</td>
      <td>You need to list all of the entry points you want this plugin to process.</td>
    </tr>
    <tr>
      <td>extensions</td>
      <td><code>string[]</code></td>
      <td><code>['js', 'jsx', 'mjs', 'ts', 'tsx', 'mts']</code></td>
      <td>This specifies which file extensions you want this plugin to process.</td>
    </tr>
    <tr>
      <td>ignorePatterns</td>
      <td><code>(string | RegExp)[]</code></td>
      <td><code>[/node_modules/]</code></td>
      <td>This specifies RegExp/string whose matched paths must be ignored by the plugin.</td>
    </tr>
    <tr>
      <td>maxWildcardDepth</td>
      <td><code>number</code></td>
      <td><code>0</code></td>
      <td>How deep should this plugin run static analysis when encountering wildcards?</td>
    </tr>
    <tr>
      <td>diagnostics</td>
      <td><code>boolean | DiagnosticsConfig</code></td>
      <td><code>true</code></td>
      <td>Toggles all diagnostics when set as a boolean, or specific diagnostics when set as an object.</td>
    </tr>
    <tr>
      <td>debug</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
      <td>Toggles debug mode. This will print debug logs if Vite's <code>logLevel</code> is set to any other value than <code>'silent'</code></td>
    </tr>
  </tbody>
</table>

### Diagnostics configuration

Diagnostics are recommendations/warnings emitted by the plugin as it analyzes the specified entry
files. They aim to help you improve the plugin's efficiency by suggesting changes and provide
explanation on why they were emitted. See
[RESOURCES](https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/tree/main/RESOURCES.md)
for a more in-depth insight about possible diagnostics.

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>definedWithinEntry</td>
      <td><code>true</code></td>
      <td>Emit warning if an entry file defines code that may prevent tree-shaking.</td>
    </tr>
    <tr>
      <td>maxDepthReached</td>
      <td><code>true</code></td>
      <td>Emits a warning when max analysis depth was reached when handling wildcard imports.</td>
    </tr>
  </tbody>
</table>

## Examples

Examples illustrating usage and benefits can be found
[here](https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/tree/main/examples). Feel
free to fork and play around. For instance, you can toggle the plugin on and off their respective
vite config file while serving in development mode and see how it affects the amount of requests
made by your browser.

This repository provides a simple CLI to help you quickly scaffold a new example, simply run the
following command from the project's root to get started:

```bash
pnpm generate-example
```

## Debugger (experimental)

Version `0.4.0` introduces
[a debugger](https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/tree/main/packages/debugger)
as an optional dependency. When installed and attached to the plugin, a debugger application will
open alongside your actual application in dev mode. This can help you get an overall idea of what
the plugin is processing and its impacts on performances.

![debugger preview](https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/assets/16818271/916fbccd-8463-4b45-b028-7dcb4da677b5)

> [!NOTE]
> This requires installing `vite-plugin-entry-shaking-debugger` and setting the `debug` option to `true`.

## Motivation

The problem this plugin tries to address is well described by this
[Vite's github issue](https://github.com/vitejs/vite/issues/8237), so we'll stick to its author's
example. Suppose your codebase contains an index file which is basically used as an entry point to
dispatch code imported from other files. This is a rather common pattern which may be handy and
avoid writing a lot of individual import statements:

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

In development mode, when Vite serves the `module.ts` file, the browser loads the `shared/index.ts`
file which initiates requests for all of the three `a`, `b` and `c` modules it relies on. The thing
is, we actually only needed the `c` module, this results in both `a` and `b` requests being
unnecessary!

As your projet and entry points grow, you end up paying the price for the ever-increasing amount of
unnecessary requests and HMR updates, which consumes time and resources. Well, that escalated
quickly. Let's try to work around this…

## The idea

The main idea is to rewrite imports from a target entry point and replace them by individual imports
of the actual module. Back with the above example:

```ts
// module.ts
import { c } from './shared';

// gets rewritten as…
import { c } from './shared/c';
```

This way, the `shared/index.ts` file is not loaded by the browser anymore and no additional requests
are initiated.

## How it works

First of all, the plugin reads all of the target entry files listed in the plugin's `targets`
option. For each entry file :

- It uses [`es-module-lexer`](https://github.com/guybedford/es-module-lexer) to get a list of
  imports and exports.
- It stores named exports that are re-exports of code imported from another module and the path they
  resolve to. It also stores whether this re-exported code is the default or a named export of its
  origin. This lets us correctly rewrite the import using the adequate statement.
- It also tracks a mutated version of the entry file where these stored named exports are removed.
  This is required because we might still import code which is actually defined within the entry
  file, rather than exported from another module. To make these work, we'll still need to serve this
  mutated version of the entry file so that this kind of code can be reached.

Whenever Vite serves a file which includes an import which resolved to one of the `targets`, this
file is transformed to rewrite the relevant import statements. It extracts the list of entities
imported from that entry file, and for each imported entity :

- it removes the import statement of that entry file.
- if it has a matching stored named export, it adds a direct import to the relevant module's
  absolute path, taking into consideration whether it imports a named export or a default export.
- If it has no matching stored named export, it is some code which is actually defined within the
  entry file. These are batched and eventually add a recomposed import of the target.

When encountering the above latest case, we have the browser still loading the `shared/index.ts`,
which could therefore trigger unnecessary requests, as described earlier. To prevent this kind of
scenario, any import of an entry point is caught and is forced to serve its mutated version we
stored while parsing the entry point file. This ensures the entry point only imports what it needs
to make the code it explicitly defines work.

[Please refer to RESOURCES.md for a more precise overview of what happens under the hood](https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/tree/main/RESOURCES.md).

## Limitations

See `es-module-lexer`'s
  [own limitations](https://github.com/guybedford/es-module-lexer#limitations).

### Behaviour

- Import statements are not cleaned up from analyzed targets. This means if you import code that was
  defined **within** a target, you might still load unnecessary modules. This is by design because
  getting rid of unused imports would require us to traverse each target's AST to make sure it is
  indeed not used, which would end up quite expensive.

- By default, tree-shaking wildcard imports only work when imported path is part of target list.
  Other wildcard imports may be handled by setting the `maxWildcardDepth` option.
  [Read more](https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/blob/main/RESOURCES.md#wildcardExports)

### Unsupported syntaxes

You should not expect errors using these. Instead, it just means the content they
intend to import won't be tree-shaken by the plugin:

- dynamic imports
- `import json from './json.json' assert { type: 'json' }`

### Using with Vite-based test runners

As a Vite user, you may be using a test runner that relies on Vite's dev server and your usual `vite.config` file. Vitest, for example, would - by default - still use this plugin when running tests. This means tested/imported modules and even test files themselves may be transformed. **This could be an issue when some of your tests rely on mocks whose references are affected by this plugin [(read more on this)](https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/discussions/47#discussioncomment-9248007)**.

> To properly benefit from this plugin within test files, one have to understand how the plugin behaves, how vite's resolver behaves and have a clear overview of their codebase.

Unless you're confident about the above statement, it is recommended to disable this plugin when running tests.

## Useful links

- [Vite's documentation](https://vitejs.dev/guide/api-plugin.html#plugin-ordering)
- [Contribution guide](https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/blob/main/CONTRIBUTING.md)
- [Resources](https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/blob/main/RESOURCES.md)
