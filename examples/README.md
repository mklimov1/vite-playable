# example

Local fixture for developing `@mklimov1/vite-playable` — **not** a template to
copy. It depends on the package via `file:..` (symlinked to the repo root) and
consumes it through `playableConfig`, so building here exercises the real config
end-to-end.

From the repo root:

```bash
npm run example   # builds the package, then this app with --mode develop-inline
```
