import fs from "fs";

import { type AssetPipe } from "@assetpack/core";

import { generateAssetTypes } from "./generateAssetTypes";

export function generateAssetTypesPipe(): AssetPipe {
  return {
    name: "generate-asset-types",

    defaultOptions: {},

    async finish(_asset, _options, pipeSystem): Promise<void> {
      try {
        const manifestPath =
          pipeSystem.getPipe("pixi-manifest").defaultOptions.output;

        const stat = fs.statSync(manifestPath);

        if (stat.isFile()) {
          // biome-ignore lint/suspicious/noConsole: build-time progress log
          console.log("generate types...");
          await generateAssetTypes({});
        }
      } catch {
        throw new Error("manifest.json not found");
      }
    },
  };
}
