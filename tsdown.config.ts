import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/assetpack.ts", "src/cli/init.ts"],
  format: "esm",
  dts: true,
  // type:module already makes .js ESM — emit .js/.d.ts (not .mjs) to match exports/bin.
  fixedExtension: false,
  // deps and peerDependencies are auto-externalized by tsdown.
});
