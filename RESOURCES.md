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

Now, let's start with the obvious point when talking about Vite plugins: the plugin entry, which is
our `index.ts` file. You reading this probably means you're new to the codebase, so just forget
about both `handleHotUpdate` and `configureServer` as they're not relevant at first. The plugin
entry is pretty straight-forwards and should be quite understandable by just reading it. It
basically does only two things:

1. First analyzes entries set through the `targets` option.
2. Then transforms served files accordingly.

### 1. Analyzing entries

Once Vite's final configuration is resolved through the `configResolved` hook, the plugin starts
analyzing the entries set through the `targets` option. The idea is to collect valuable information
about every single entity they export. This let us later rewrite "imports from some entry" to
"imports from entity's actual source".

> **Note:** The `configResolved` hook is async because we don't want Vite to start serving files
> before the analyzis is done. This is why we use `await` here.

This analyzis is a mandatory step which feeds a map of `EntryData` for each `EntryPath`, where
`EntryData` is the absolute path to the entry file and `EntryData` an object of the following
structure:

#### `EntryData`

| **Property**       | **Type**       | **Description**                                |
| ------------------ | -------------- | ---------------------------------------------- |
| `exports`          | `EntryExports` | Map of entities exported by an entry file      |
| `source`           | `string`       | Source content of the entry file               |
| `updatedSource`    | `string`       | Cleaned-up content of the entry file           |
| `hasDefaultExport` | `boolean?`     | Does the entry file default exports something? |

- The `updatedSource` property is used to serve a cleaned-up/lighter version of the entry file
  whenever an external module imports some code that was actually defined within the entry file.
- The `exports` property is a map of `ImportParams` where the key is the name of the exported entity
  (named or `default`), and the value is an object containing valuable information about their
  source. `ImportParams` have the following structure:

#### `ImportParams`

| **Property**    | **Type**  | **Description**                                                      |
| --------------- | --------- | -------------------------------------------------------------------- |
| `path`          | `string`  | Path to imported entity                                              |
| `importDefault` | `boolean` | Source content of the entry file                                     |
| `originalName`  | `string?` | Original name of the entity (as exported by its source file)         |
| `alias`         | `string?` | Alias of the entity (as imported from the entry by consomming code). |

### 2. Transforming served files
