# @mklimov1/vite-game-forge

Vite config toolkit for building playable ads: per-network presets, single-file
inlining, asset zipping, size reporting, and shared infra configs (Biome +
TypeScript).

## Install

```bash
npm i -D @mklimov1/vite-game-forge
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { playableConfig } from "@mklimov1/vite-game-forge";

export default defineConfig(({ mode }) => playableConfig({ network: mode }));
```

`mode` selects the network preset; unknown values fall back to `develop`.

## Build

Each network builds into `dist/<network>/` and is zipped to
`dist/zips/<network>.zip`:

```bash
# assets emitted alongside index.html
vite build --mode develop

# everything (JS, CSS, images, fonts) inlined into a single index.html
vite build --mode develop-inline
```

## With Assetpack

```bash
npm i -D @assetpack/core
```

```ts
import { defineConfig } from "vite";
import { playableConfig } from "@mklimov1/vite-game-forge";
import {
  assetpackPlugin,
  playablePipesConfig,
} from "@mklimov1/vite-game-forge/assetpack";

export default defineConfig(({ mode }) =>
  playableConfig({
    network: mode,
    plugins: [assetpackPlugin({ pixiPipes: playablePipesConfig })],
  }),
);
```

## Infra CLI

`infra-init` copies shared configs into your project's `.infra/`, writes a root
`biome.json` that extends them, and merges the required scripts and dev
dependency into your `package.json`:

```bash
npx infra-init              # Biome + TypeScript configs
npx infra-init --playable   # + playable globals.d.ts
npx infra-init --force      # overwrite existing files and package.json keys
```

Then install the added dependency and lint:

```bash
npm install
npm run lint     # biome lint .
npm run check    # biome check --write .
```

## Development

Local fixtures for working on this package (not needed by consumers):

```bash
npm run example  # build the package + the examples/ app that consumes it
npm test         # infra-init CLI end-to-end tests
```
