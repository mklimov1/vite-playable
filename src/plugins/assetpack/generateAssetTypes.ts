import fs from "fs/promises";
import path from "path";

export const generateAssetTypes = async ({
  manifestPath = "src/shared/generated/manifest.json",
  outputPath = "src/shared/generated/index.ts",
}: {
  manifestPath?: string;
  outputPath?: string;
}) => {
  try {
    const absManifestPath = path.resolve(manifestPath);

    const absOutputPath = path.resolve(outputPath);

    const content = await fs.readFile(absManifestPath, "utf-8");

    const manifest = JSON.parse(content);

    const bundles = manifest.bundles
      .map(
        // biome-ignore lint/suspicious/noExplicitAny: manifest bundle shape is dynamic
        (b: any) => `  "${b.name.toUpperCase()}": "${b.name}"`,
      )
      .join(",\n");

    const assetKeys = new Set<string>();

    // biome-ignore lint/suspicious/noExplicitAny: manifest bundle shape is dynamic
    manifest.bundles.forEach((b: any) =>
      Object.keys(b.assets).forEach((key) => assetKeys.add(key)),
    );

    const assets = [...assetKeys].map((k) => `  "${k}": "${k}"`).join(",\n");

    const tsContent =
      "// 🚨 AUTO-GENERATED — DO NOT EDIT\n" +
      "// Generated from manifest.json\n\n" +
      `export const Bundles = {\n${bundles}\n} as const;\n\n` +
      `export const Assets = {\n${assets}\n} as const;\n\n` +
      "export type BundleName = keyof typeof Bundles;\n" +
      "export type AssetName = keyof typeof Assets;\n";

    await fs.writeFile(absOutputPath, tsContent, "utf-8");
    // biome-ignore lint/suspicious/noConsole: build-time progress log
    console.log("✅ [assetpack] Generated asset type definitions.");
  } catch (err) {
    console.error("❌ Failed to generate asset types:", err);
  }
};
