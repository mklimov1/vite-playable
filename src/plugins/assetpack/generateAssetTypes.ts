import fs from "fs/promises";
import path from "path";

// Minimal shape of a pixi manifest — only what this generator reads.
interface Manifest {
  bundles: { name: string; assets: { alias: string | string[] }[] }[];
}

// A pixi manifest entry lists the same asset under several alias forms
// (with/without folder path, with/without extension). Pick the canonical one:
// the longest alias without a file extension.
const hasExtension = (alias: string) => /\.[^/.]+$/.test(alias);

const pickAlias = (alias: string | string[]): string => {
  const all = Array.isArray(alias) ? alias : [alias];
  const withoutExt = all.filter((a) => !hasExtension(a));
  const pool = withoutExt.length ? withoutExt : all;

  return pool.reduce((longest, a) => (a.length > longest.length ? a : longest));
};

export const generateAssetTypes = async ({
  manifestPath = "src/shared/generated/manifest.json",
  outputPath = "src/shared/generated/index.ts",
}: {
  manifestPath?: string;
  outputPath?: string;
} = {}) => {
  try {
    const manifest: Manifest = JSON.parse(
      await fs.readFile(path.resolve(manifestPath), "utf-8"),
    );

    const bundles = manifest.bundles
      .map((b) => `  "${b.name}": "${b.name}"`)
      .join(",\n");

    const aliases = new Set<string>();

    for (const bundle of manifest.bundles) {
      for (const entry of bundle.assets) {
        aliases.add(pickAlias(entry.alias));
      }
    }

    const assets = [...aliases]
      .sort()
      .map((a) => `  "${a}": "${a}"`)
      .join(",\n");

    const tsContent = `// 🚨 AUTO-GENERATED — DO NOT EDIT
// Generated from manifest.json

export const BundleKeys = {
${bundles}
} as const;

export const AssetKeys = {
${assets}
} as const;

export type BundleName = keyof typeof BundleKeys;
export type AssetName = keyof typeof AssetKeys;
`;

    await fs.writeFile(path.resolve(outputPath), tsContent, "utf-8");
    console.log("✅ [assetpack] Generated asset type definitions.");
  } catch (err) {
    console.error("❌ Failed to generate asset types:", err);
  }
};
