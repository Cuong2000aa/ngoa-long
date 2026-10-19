/**
 * Chụp VFX trong trận 3D thật (giao diện chơi).
 * node scripts/shot-battle-vfx.mjs [flash] [out.png] [baseUrl]
 * VD: node scripts/shot-battle-vfx.mjs gold_soft docs/_shots/thiet-bich-3d.png
 */
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const flash = process.argv[2] ?? "gold_soft";
const out = resolve(process.argv[3] ?? "docs/_shots/battle-vfx.png");
const base = process.argv[4] ?? "http://127.0.0.1:5173";
const text = process.argv[5] ?? (flash === "gold_soft" ? "THIẾT BÍCH" : flash.toUpperCase());

const chrome =
  process.env.CHROME ||
  [
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].find((p) => existsSync(p));

if (!chrome) {
  console.error("Không tìm thấy Edge/Chrome");
  process.exit(1);
}

await mkdir(dirname(out), { recursive: true });

const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("[console]", m.text());
});

await page.goto(`${base}/?smoke=1`, { waitUntil: "load", timeout: 90000 });
await page.waitForFunction(
  () => document.documentElement.getAttribute("data-smoke") === "ready",
  { timeout: 90000 }
);
console.log("smoke ready");

// Mở Phó Bản
await page.click('button.nav-item[data-panel="tower"]');
await page.waitForSelector("#panel-body [data-stage-quick]", { timeout: 30000 });
await page.click("#panel-body [data-stage-quick]");
console.log("clicked Đánh");

// Đợi trận 3D
await page.waitForSelector("#combat-overlay:not([hidden])", { timeout: 30000 });
await page.waitForFunction(
  () => {
    const v = window.NLCombatUI && window.NLCombatUI.getView && window.NLCombatUI.getView();
    return !!(v && v._battle3d && v._battle3d.fighters && v._battle3d.fighters.size > 0);
  },
  { timeout: 45000 }
);
console.log("battle3d ready");

// Dừng playback để chụp FX rõ (không _skip — skip sẽ kết thúc trận)
await page.evaluate(() => {
  const v = window.NLCombatUI.getView();
  if (v) v._pausedForShot = true;
});

// Bắn FX Thiết Bích (shield → gold_soft) trên tướng ta + banner 2D
const info = await page.evaluate(
  ({ flash, text }) => {
    const v = window.NLCombatUI.getView();
    const br = v && v._battle3d;
    if (!br) return { ok: false, reason: "no battle3d" };
    const allies = [];
    br.fighters.forEach((f, uid) => {
      if (f && !f.dead && f.side === "ally") allies.push({ uid, slot: f.slot, name: f.name });
    });
    if (!allies.length) return { ok: false, reason: "no allies" };
    allies.sort((a, b) => a.slot - b.slot);
    const caster = allies[0].uid;
    // Aura 3D đúng pipeline trận
    br.skillFlash(caster, flash, []);
    // Banner HUD giống combat
    if (v.playSkillFx) {
      v.playSkillFx({
        uid: caster,
        flash: flash,
        motif: flash === "gold_soft" ? "shield" : null,
        text: text,
        name: text,
        targets: [],
      });
    }
    return { ok: true, caster, allies };
  },
  { flash, text }
);

console.log("fx", info);
if (!info.ok) {
  await page.screenshot({ path: out.replace(/\.png$/, "-fail.png") });
  await browser.close();
  process.exit(2);
}

await page.waitForTimeout(180);
await page.screenshot({ path: out, fullPage: false });
await page.waitForTimeout(220);
const out2 = out.replace(/\.png$/, "-peak.png");
await page.screenshot({ path: out2, fullPage: false });
console.log("saved", out, "and", out2);
await browser.close();
