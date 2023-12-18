# Debugger for `vite-plugin-entry-shaking`

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
