#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INFRA_DIR = join(__dirname, "..", "..", "infra");
const TARGET_DIR = process.cwd();
const INFRA_TARGET = join(TARGET_DIR, ".infra");
const force = process.argv.includes("--force");
const preset = process.argv.includes("--playable") ? "playable" : "default";

// Files copied verbatim into the consumer's .infra/, per preset dir.
// Explicit allowlists: add a new template here to ship it. Files not listed
// (e.g. package.additions.json, which is merged instead) are never copied.
const COPY_FILES: Record<string, string[]> = {
  shared: ["biome.json", "tsconfig.json"],
  playable: ["globals.d.ts"],
};

const MERGE_SECTIONS = ["scripts", "devDependencies", "dependencies"] as const;

const mergePackageJson = () => {
  const additionsPath = join(INFRA_DIR, "shared", "package.additions.json");
  const pkgPath = join(TARGET_DIR, "package.json");

  if (!existsSync(additionsPath)) return;
  if (!existsSync(pkgPath)) {
    console.log("  ⚠️  package.json not found — skipping merge");
    return;
  }

  const additions = JSON.parse(readFileSync(additionsPath, "utf-8"));
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  let changed = false;
  let depsChanged = false;

  for (const section of MERGE_SECTIONS) {
    const add = additions[section];
    if (!add) continue;

    pkg[section] ??= {};

    for (const [key, value] of Object.entries(add)) {
      const existing = pkg[section][key];

      if (existing === undefined) {
        pkg[section][key] = value;
        changed = true;
        depsChanged ||= section !== "scripts";
        console.log(`  ✅ ${section}.${key} — added`);
      } else if (existing === value) {
        continue;
      } else if (force) {
        pkg[section][key] = value;
        changed = true;
        depsChanged ||= section !== "scripts";
        console.log(`  ♻️  ${section}.${key} — ${existing} → ${value}`);
      } else {
        console.log(
          `  ⏭  ${section}.${key} — exists (${existing}), use --force to overwrite`,
        );
      }
    }
  }

  if (changed) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
    console.log("  ✅ package.json — updated");
  }

  if (depsChanged) {
    console.log("\n  ⚠️  Dependencies changed — run: npm install");
  }
};

const patchTsconfig = () => {
  const tsconfigPath = join(INFRA_TARGET, "tsconfig.json");
  if (!existsSync(tsconfigPath)) return;

  let content = readFileSync(tsconfigPath, "utf-8");

  if (content.includes("globals.d.ts")) return;

  content = content.replace(
    /("include"\s*:\s*\[)(.*?)(\])/s,
    `$1$2, "globals.d.ts"$3`,
  );

  writeFileSync(tsconfigPath, content, "utf-8");
  console.log("  ✅ tsconfig.json — added globals.d.ts to include");
};

const copyPreset = (name: keyof typeof COPY_FILES) => {
  for (const file of COPY_FILES[name]) {
    copyFile(join(INFRA_DIR, name, file), join(INFRA_TARGET, file));
  }
};

// Biome auto-discovers a root config at the project root, so the shipped
// .infra/biome.json (marked "root": false) is pulled in via a thin root stub.
const writeRootBiome = () => {
  const dest = join(TARGET_DIR, "biome.json");

  if (!force && existsSync(dest)) {
    console.log("  ⏭  biome.json — exists, use --force to overwrite");
    return;
  }

  const stub = { extends: ["./.infra/biome.json"] };
  writeFileSync(dest, JSON.stringify(stub, null, 2) + "\n", "utf-8");
  console.log("  ✅ biome.json — extends ./.infra/biome.json");
};

const copyFile = (src: string, dest: string) => {
  const name = dest.replace(TARGET_DIR + sep, "");

  if (!force && existsSync(dest)) {
    console.log(`  ⏭  ${name} — exists, use --force to overwrite`);
    return;
  }

  cpSync(src, dest);
  console.log(`  ✅ ${name}`);
};

mkdirSync(INFRA_TARGET, { recursive: true });

copyPreset("shared");

if (preset === "playable") {
  copyPreset("playable");
  patchTsconfig();
}

writeRootBiome();
mergePackageJson();

console.log(`\n  Done! (preset: ${preset})\n`);
