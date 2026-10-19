// Nén model gốc ở assets-src/<dir> -> assets/city/<dir>: node scripts/optimize-models.mjs buildings3d
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const dir = process.argv[2] ?? "buildings3d";
const src = resolve("assets-src", dir);
const out = resolve("assets/city", dir);
mkdirSync(out, { recursive: true });
const cli = resolve("node_modules/@gltf-transform/cli/bin/cli.js");

for (const name of readdirSync(src)) {
  const from = join(src, name);
  const to = join(out, name);
  if (name.endsWith(".glb")) {
    execFileSync(process.execPath, [
      cli, "optimize", from, to,
      "--compress", "meshopt",
      "--texture-compress", "webp",
      "--texture-size", "1024",
      "--simplify-error", "0.0005",
    ], { stdio: "pipe" });
  } else {
    copyFileSync(from, to);
  }
  const a = statSync(from).size / 1e6;
  const b = statSync(to).size / 1e6;
  console.log(`${name.padEnd(18)} ${a.toFixed(1)}MB -> ${b.toFixed(1)}MB`);
}
