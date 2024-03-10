# Resources

Oh, here you are! You either misclicked or genuinely have some interest in this Vite plugin! Either
way is fine, very glad to see you there! This is a rather unorganized yet useful list of resources,
guides and cheatsheets that may help you understand how this plugin works under the hood, or at
least give you an overall idea of its design.

## I'm new to the codebase, how do I get started?

This document supposes you've read the README and have basic understanding of how Vite works. If you
don't, you may want to learn a bit more by reading their [guide](https://vitejs.dev/guide/) and
exploring their [plugin API](https://vitejs.dev/guide/api-plugin.html). But don't worry: Vite is
really well designed and documented and there's no need to be afraid at all _(forget about your
Webpack traumas, it's over /s)_!

### Plugin overview

Let's start with the obvious point when talking about Vite plugins: the plugin entry, which is our
`index.ts` file. You reading this probably means you're new to the codebase, so just forget about
both `handleHotUpdate` and `configureServer` as they're not relevant at first. The plugin entry is
pretty straight-forward and should be quite understandable by just reading it. It basically does
only two things:

1. First analyzes entries set in the `targets` option.
2. Then transforms served files accordingly.

The whole plugin logic is driven by a plugin `Context` class that stores and shares the following
properties:

| **Property** | **Type**          | **Description**             |
| ------------ | ----------------- | --------------------------- |
| `entries`    | `PluginEntries`   | Map of analyzed entry files |
| `targets`    | `ExtendedTargets` | Map of registered targets   |
| `resolver`   | `ResolveFn`       | Vite's resolver             |
| `logger`     | `Logger`          | Plugin's Logger             |

Here is an overview of the main files it uses:

<table>
  <thead>
    <tr><th colspan="2">Plugin logic</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>index.ts</code></td>
      <td><code>options.ts</code></td>
    </tr>
    <tr>
      <td><code>context.ts</code></td>
      <td><code>logger.ts</code></td>
    </tr>
    <tr>
      <td><code>diagnostics.ts</code></td>
      <td><code>event-bus.ts</code></td>
    </tr>
  </tbody>
  <thead>
    <tr>
      <th>Analyzing entries</th>
      <th>Transforming files</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>analyze-entry.ts</code></td>
      <td><code>cleanup-entry.ts</code></td>
    </tr>
    <tr>
      <td><code>transform.ts</code></td>
      <td><code>analyze-import.ts</code></td>
    </tr>
  </tbody>
  <thead>
      <tr><th colspan="2">Utilities</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>parse.ts</code></td>
      <td><code>timer.ts</code></td>
    </tr>
    <tr>
      <td><code>urls.ts</code></td>
      <td><code>utils.ts</code></td>
    </tr>
  </tbody>
  <thead>
    <tr><th colspan="2">Types</th></tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2"><code>types.ts</code></td>
    </tr>
  </tbody>
</table>

> **Note:** You may encounter both "targets" and "entries" terms used interchangeably across the
> codebase, issues or documentation. They basically mean the same thing, but I would usually
> consider "target" as a path and "entry" as a file _(do not trust me though, I use them
> inconsistently myself)_.

### 1. Analyzing entries

Once Vite's final configuration is resolved through the `configResolved` hook, the plugin starts
analyzing the entries set in the `targets` option. The idea is to collect valuable information about
every single entity they export. This let us later rewrite "imports from some entry" to "imports
from entity's actual source".

The `configResolved` hook is async because we don't want Vite to start serving files before the
analysis is done. This is why we `await` the analysis here. This may delay startup time based on the
amount of targets you've specified.

This analysis is a mandatory step which feeds a map of `EntryData` for each `EntryPath`. The
underlying code is pretty simple and should be intelligible when reading from top to bottom. Let's
still provide further insight:

- `EntryPath` is the absolute path to an entry file (a target)
- `EntryData` is an object of the following structure:

##### `EntryData`

| **Property**      | **Type**          | **Description**                           |
| ----------------- | ----------------- | ----------------------------------------- |
| `source`          | `string`          | Source content of the entry file          |
| `updatedSource`   | `string`          | Cleaned-up content of the entry file      |
| `wildcardExports` | `WildcardExports` | List of wildcard exports                  |
| `exports`         | `EntryExports`    | Map of entities exported by an entry file |
| `depth`           | `number`          | Static analysis depth                     |

#### `source`

The `source` property stores the entry file's source content as it eventually gets cleaned-up and
stored in a `updatedSource` property.

#### `updatedSource`

The `updatedSource` property is used to serve a cleaned-up/lighter version of the entry file
whenever an external module imports some code that was actually defined within the entry file. In
that cleaned-up version, all export statements which do not rely on code defined within the file are
removed since they're eventually rewritten to their actual sources. This way, if you were to import
some code defined within the entry file, serving the cleaned-up version would not necessarily
trigger requests for modules that could be tree-shaken.

However, because such _"defined-within-entry"_ code could rely on imported modules, we can't just
remove import statements from the cleaned-up version. Analyzing _"defined-within-entry"_ code to
determine which imports are actually used would be quite expensive, so we don't. This basically
means whenever one imports code defined from an entry file, some module could still be loaded even
though they're not actually used (which somehow clashes the purpose of this plugin).

Such pattern (mixing both [facade](https://github.com/guybedford/es-module-lexer#facade-detection)
and code definition) is not recommended and could be considered a bad practice, but should
definitely be supported and not break anything. Using this plugin probably means one's main
motivation is to reduce the amount of unnecessary requests. Therefore, by default, warnings are
emitted whenever a target both imports modules and exposes code it actually defines. Despite the
warnings hinting for quite an easy (and recommended) code-split, it may be silenced through the
`ignoreMixedTarget` option.

#### `wildcardExports`

Entry files may aggregate modules by either:

- directly exporting `* from './some-module'` or `* as SomeAlias from './some-module'`
- importing `* as SomeAlias from './some-module'` and then exporting `SomeAlias`

Such patterns are quite common and may even be the reason why you ended up here in the first place.
Being able to mimic tree-shaking behaviour on such patterns requires us to also analyze all of
wildcard-imported modules, which could lead to
[performance issues](https://github.com/Dschungelabenteuer/vite-plugin-entry-shaking/issues/34#issuecomment-1815494589).
Wildcard imports/exports of other entries do not have incidence on performances since these are
analyzed anyway; they should work out of the box. However, wildcard-importing a non-target module
may introduce some bloat. Especially if the module itself exports wildcard-imported modules, etc.

Therefore, by default, this plugin only analyzes and tree-shakes wildcard-imports of modules that
are defined as targets. However, this may be overidden through the `maxWildcardDepth` option (which
defaults to `0`). Starting with a default depth of `0` for explicit targets, all encountered
wildcard imports are recursively added as "implicit" targets until the specified max depth is
reached.

Suppose you set the `maxWildcardDepth` option to `1` and have the following files:

```ts
// entry.ts
export * from './child-1';

// child-1.ts
export * from './child-2';
```

The `child-1` wildcard import occurs in depth `0`, which does not exceed the `maxWildcardDepth`
option, we therefore add `child-1` as an implicit target. `child-1` wildcard-exports `child-2` in
depth `1`, which reaches the `maxWildcardDepth` option. We therefore do not do anything, the
`child-2` export will remain untouched and won't be tree-shaken.

Wildcard exports are stored for each target as `WildcardExports`, which have the following
structure:

| **Property** | **Type**              | **Description**                                               |
| ------------ | --------------------- | ------------------------------------------------------------- |
| `named`      | `Map<string, string>` | Map of named export to resolved wildcard-imported module path |
| `direct`     | `string[]`            | Direct wildcard exports' paths                                |

In other words, `named` are for aliased wildcard imports/exports, and `direct` are for direct
wildcard exports.

#### `exports`

The `exports` property is a map of `ImportParams` where the key is the name of the exported entity
(named or `default`), and the value is an object containing valuable information about their source.
`ImportParams` have the following structure:

| **Property**    | **Type**  | **Description**                                                      |
| --------------- | --------- | -------------------------------------------------------------------- |
| `path`          | `string`  | Path to imported entity                                              |
| `importDefault` | `boolean` | Source content of the entry file                                     |
| `originalName`  | `string?` | Original name of the entity (as exported by its source file)         |
| `alias`         | `string?` | Alias of the entity (as imported from the entry by consomming code). |

#### `depth`

Depth at which the target was encountered. If this is a an explicit target, depth is `0`. If this is
an implicit target which was added through a wildcard import, depth is `1`. If this is an implicit
target which was added through a wildcard import of an implicit target, depth is `2`, etc. Depth let
us keep track of static analyses' stacks so that we can stop them before analyzing them becomes
slower than simply importing them.

### 2. Transforming served files

Once all of the targets are analyzed, Vite server is ready to go and starts as you would expect.
Now, whenever a file matching the `extensions` option (and that was not ignored through the
`ignorePatterns` option) gets served by Vite, it gets transformed by the plugin to rewrite imports
from targets to their source modules. It only transform files when they import at least one entity
from any target. Here's what basically happens when transforming a file, for each target import
encountered:

#### Retrieve target data

The first step is to retrieve data that were gathered for such targets. This data can easily be
accessed through the `context.entries` map, where each map key is the absolute path to the relevant
target.

#### Analyze import statement

Once we know which target we're dealing with, we need to parse the import statement to get details
about the imported entities. This could either be:

- a default import (e.g. `import Something from './some-module'`)
- named import(s) (e.g. `import { Thing } from './some-module'`)
- a wildcard import (e.g. `import * from './some-module'`)
- mixed imports (e.g. `import Something, { Thing } from './some-module'`)

#### Resolve imported entities

Once we know exactly what was imported, we need to resolve the actual source of each imported
entity. There are several possible scenarios:

- **default import:** importing a default export from a target is pretty straight-forward because it
  should be exposed as the `default` key of entry's `exports` map. If it does not exist, the plugin
  does not do anything because this supposes both IDE and runtime errors.
- **named import:** importing a named entity from a target is also straight-forward because it
  should be exposed by entry's `exports` map. If it does not exist, maybe we're importing an entity
  from a wildcard-exported module. See next point.
- **wildcard import:** If a named entity could not be resolved by an entry's `export` map, there's
  still a chance it was re-exported from a wildcard-imported module. Here's the decision tree that
  gets applied:

  - We first try to find the entity inside `context.wildcards.named`'s map. Matching the entity
    against that map means it was wildcard-imported with an alias and re-exported (e.g.
    `import * as Alias from '…'` then `export { Alias }` or `export * as Alias from '…'`).
  - If it's still not resolved, maybe it was re-exported with a wildcard-export statement (e.g.
    `export * from '…'`). We need to find the entity across paths saved in the
    `context.wildcards.direct` array. These paths should be registered as implicit targets and
    analyzed beforehand.

  If nothing was resolved, then the import statement won't be transformed to preserve original
  behaviour.

#### Rewrite import statement

At this point, all imported entities should be re-written: instead of importing them from a given
target, they should be imported from their actual sources. Vite then serves the transformed file :-)

<!-- @todo

### Debugging

### Logging

### Tests

-->
