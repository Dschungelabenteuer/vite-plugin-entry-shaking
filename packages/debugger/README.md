# Debugger for `vite-plugin-entry-shaking`

## Install

```bash
# Using npm
npm i -D vite-plugin-entry-shaking-debugger
# Using Yarn
yarn add -D vite-plugin-entry-shaking-debugger
# Using pnpm
pnpm add -D vite-plugin-entry-shaking-debugger
```

## Usage

Turn it on by setting `debug` to `true` in `vite.config.js`:

```ts
export default defineConfig({
  plugins: [
    EntryShakingPlugin({
      targets: ['…'],
      debug: true,
    }),
  ],
});
```
