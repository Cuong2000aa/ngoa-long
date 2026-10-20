#!/usr/bin/env node
/**
 * Generate skill FX PNG sequences via Pixel Ability FX Forge (Apache-2.0).
 * Ref: _dl/vfx-refs/pixel-ability-fx-generator
 *
 * Usage:
 *   node scripts/forge-generate-fx.mjs
 *
 * Writes: assets/fx/forge/<id>/frame_01.png … + recipe.json
 * Credits: assets/CREDITS.md (forge Apache-2.0)
 */
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FORGE = join(ROOT, "_dl/vfx-refs/pixel-ability-fx-generator");
const OUT = join(ROOT, "assets/fx/forge");

/** One-shot combat sheets — family/element tuned for Ngọa Long (not neon sci-fi). */
/** Full element set for 3D rebuild — regenerate anytime. */
const BATCH = [
  { id: "frost_burst", family: "burst", element: "frost", power: "standard", seed: 31001, looping: false, frames: 12, size: 128 },
  { id: "storm_burst", family: "burst", element: "storm", power: "standard", seed: 31002, looping: false, frames: 12, size: 128 },
  { id: "ember_burst", family: "burst", element: "fire", power: "standard", seed: 31003, looping: false, frames: 12, size: 128 },
  { id: "shadow_burst", family: "burst", element: "shadow", power: "standard", seed: 31004, looping: false, frames: 12, size: 128 },
  { id: "blood_burst", family: "burst", element: "blood", power: "standard", seed: 31005, looping: false, frames: 12, size: 128 },
  { id: "earth_burst", family: "burst", element: "earth", power: "standard", seed: 31006, looping: false, frames: 12, size: 128 },
  { id: "nature_burst", family: "burst", element: "nature", power: "standard", seed: 31007, looping: false, frames: 12, size: 128 },
  { id: "tide_burst", family: "burst", element: "tide", power: "standard", seed: 31008, looping: false, frames: 12, size: 128 },
  { id: "arcane_burst", family: "burst", element: "arcane", power: "standard", seed: 31009, looping: false, frames: 12, size: 128 },
  { id: "radiance_aura", family: "aura", element: "radiance", power: "standard", seed: 32001, looping: true, frames: 12, size: 128 },
  { id: "frost_aura", family: "aura", element: "frost", power: "restrained", seed: 32002, looping: true, frames: 12, size: 128 },
  { id: "ward_barrier", family: "barrier", element: "radiance", power: "standard", seed: 33001, looping: true, frames: 12, size: 128 },
  // Extra packs — 3D rebuild coverage
  { id: "ember_aura", family: "aura", element: "fire", power: "standard", seed: 32003, looping: true, frames: 12, size: 128 },
  { id: "nature_aura", family: "aura", element: "nature", power: "standard", seed: 32004, looping: true, frames: 12, size: 128 },
  { id: "blood_aura", family: "aura", element: "blood", power: "restrained", seed: 32005, looping: true, frames: 12, size: 128 },
  { id: "storm_aura", family: "aura", element: "storm", power: "standard", seed: 32006, looping: true, frames: 12, size: 128 },
  { id: "steel_burst", family: "burst", element: "earth", power: "restrained", seed: 31010, looping: false, frames: 12, size: 128 },
  { id: "shadow_barrier", family: "barrier", element: "shadow", power: "standard", seed: 33002, looping: true, frames: 12, size: 128 },
];

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
  ".md": "text/plain",
};

function startStaticServer(root) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let path = decodeURIComponent((req.url || "/").split("?")[0]);
      if (path === "/") path = "/index.html";
      // strip ?v= query already above
      const file = join(root, path.replace(/^\//, ""));
      if (!file.startsWith(root) || !existsSync(file)) {
        res.writeHead(404);
        res.end("missing");
        return;
      }
      const type = MIME[extname(file)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      res.end(readFileSync(file));
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

async function main() {
  if (!existsSync(join(FORGE, "js/AbilityEffect.js"))) {
    console.error("Missing forge at", FORGE);
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  const { server, port } = await startStaticServer(FORGE);
  const base = `http://127.0.0.1:${port}`;
  console.log("Forge server", base);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${base}/index.html`, { waitUntil: "networkidle" });

  const results = await page.evaluate(async (batch) => {
    const mod = await import(`./js/AbilityEffect.js?t=${Date.now()}`);
    const { createEffectRecipe, renderEffectFrames } = mod;
    const out = [];
    for (const spec of batch) {
      const recipe = createEffectRecipe({
        family: spec.family,
        element: spec.element,
        power: spec.power,
        seed: spec.seed,
      });
      recipe.looping = !!spec.looping;
      // Combat one-shots: shorter, punchier
      if (!spec.looping) {
        recipe.duration = Math.min(recipe.duration, 1.85);
        recipe.brightness = Math.min(1.35, (recipe.brightness || 1) * 1.08);
      }
      const { frames } = await renderEffectFrames({
        recipe,
        size: spec.size,
        frameCount: spec.frames,
      });
      const pngs = frames.map((c) => c.toDataURL("image/png"));
      out.push({
        id: spec.id,
        recipe: {
          id: spec.id,
          seed: recipe.seed,
          family: recipe.family,
          element: recipe.element,
          power: recipe.power,
          name: recipe.name,
          formation: recipe.formation,
          looping: recipe.looping,
          duration: recipe.duration,
          frames: spec.frames,
          size: spec.size,
          source: "pixel-ability-fx-forge",
          license: "Apache-2.0",
        },
        pngs,
      });
    }
    return out;
  }, BATCH);

  for (const item of results) {
    const dir = join(OUT, item.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "recipe.json"), JSON.stringify(item.recipe, null, 2) + "\n");
    item.pngs.forEach((dataUrl, i) => {
      const b64 = dataUrl.replace(/^data:image\/png;base64,/, "");
      const name = `frame_${String(i + 1).padStart(2, "0")}.png`;
      writeFileSync(join(dir, name), Buffer.from(b64, "base64"));
    });
    console.log("wrote", item.id, item.pngs.length, "frames →", dir);
  }

  writeFileSync(
    join(OUT, "INDEX.json"),
    JSON.stringify(
      {
        note: "Generated from Pixel Ability FX Forge (Apache-2.0). Remap via battleVfx TEX.forge*",
        generatedAt: new Date().toISOString(),
        packs: results.map((r) => r.recipe),
      },
      null,
      2
    ) + "\n"
  );

  await browser.close();
  server.close();
  console.log("Done —", results.length, "packs in assets/fx/forge/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
