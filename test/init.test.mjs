import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, "..", "dist", "cli", "init.js");

const readJson = (path) => JSON.parse(readFileSync(path, "utf-8"));

// Fresh temp consumer project with the given package.json fields.
const setupConsumer = (pkg = {}) => {
  const dir = mkdtempSync(join(tmpdir(), "vgf-init-"));
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "consumer", version: "1.0.0", ...pkg }, null, 2),
  );
  return dir;
};

const runInit = (dir, args = []) =>
  execFileSync("node", [CLI, ...args], { cwd: dir, stdio: "pipe" });

test("default preset copies configs and merges package.json", (t) => {
  const dir = setupConsumer();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  runInit(dir);

  assert.ok(existsSync(join(dir, ".infra", "biome.json")), ".infra/biome.json");
  assert.ok(
    existsSync(join(dir, ".infra", "tsconfig.json")),
    ".infra/tsconfig.json",
  );

  const rootBiome = readJson(join(dir, "biome.json"));
  assert.deepEqual(rootBiome.extends, ["./.infra/biome.json"]);

  const pkg = readJson(join(dir, "package.json"));
  assert.equal(pkg.scripts.lint, "biome lint .");
  assert.ok(pkg.devDependencies["@biomejs/biome"]);
});

test("package.additions.json is merged, not copied", (t) => {
  const dir = setupConsumer();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  runInit(dir);

  assert.ok(
    !existsSync(join(dir, ".infra", "package.additions.json")),
    "additions file must not be copied verbatim",
  );
});

test("existing keys are preserved without --force", (t) => {
  const dir = setupConsumer({ scripts: { lint: "echo custom" } });
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  runInit(dir);

  assert.equal(readJson(join(dir, "package.json")).scripts.lint, "echo custom");
});

test("--force overwrites conflicting keys", (t) => {
  const dir = setupConsumer({ scripts: { lint: "echo custom" } });
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  runInit(dir, ["--force"]);

  assert.equal(
    readJson(join(dir, "package.json")).scripts.lint,
    "biome lint .",
  );
});

test("--playable copies globals.d.ts and patches tsconfig include", (t) => {
  const dir = setupConsumer();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  runInit(dir, ["--playable"]);

  assert.ok(existsSync(join(dir, ".infra", "globals.d.ts")), "globals.d.ts");
  assert.match(
    readFileSync(join(dir, ".infra", "tsconfig.json"), "utf-8"),
    /globals\.d\.ts/,
  );
});
