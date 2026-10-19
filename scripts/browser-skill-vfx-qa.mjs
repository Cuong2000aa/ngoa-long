#!/usr/bin/env node
/**
 * Browser QA: vào trận 3D (JS click — tránh overlay chặn Playwright click),
 * pause combat + clear FX, bắn skillFlash mọi nhóm motif×pattern đại diện.
 * node scripts/browser-skill-vfx-qa.mjs [baseUrl]
 */
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] ?? "http://127.0.0.1:5173";
const outDir = resolve(ROOT, "docs/_shots/skill-qa");
mkdirSync(outDir, { recursive: true });

const chrome =
  process.env.CHROME ||
  ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/local/bin/google-chrome"].find((p) =>
    existsSync(p)
  );
if (!chrome) {
  console.error("No Chrome");
  process.exit(1);
}

const CASES = [
  { flash: "wolf", pattern: "column", label: "LangTuyen-column-wolf" },
  { flash: "shield", pattern: "self", label: "ThietBich-shield" },
  { flash: "charge", pattern: "single", label: "KyLiep-charge" },
  { flash: "rush", pattern: "single", label: "DotKich-rush" },
  { flash: "whirlwind", pattern: "single", label: "DongXoay-whirlwind" },
  { flash: "dragon", pattern: "all", label: "HoaLong-dragon" },
  { flash: "snake", pattern: "single", label: "DocXa-snake" },
  { flash: "yellow", pattern: "single", label: "BachBo-yellow" },
  { flash: "blue_water", pattern: "all", label: "VuThanh-water" },
  { flash: "bagua", pattern: "all", label: "Bagua" },
  { flash: "thunder", pattern: "all", label: "ThanLoi-thunder" },
  { flash: "crimson", pattern: "all", label: "HuyetChien-crimson" },
  { flash: "purple", pattern: "single", label: "KyMuu-shadow" },
  { flash: "fire_rain", pattern: "all", label: "ThienHoa-fire" },
  { flash: "tiger", pattern: "front_row", label: "HoKhieu-tiger" },
  { flash: "steel", pattern: "column", label: "Slash-column-steel" },
  { flash: "green_poison", pattern: "row", label: "Poison-row" },
];

const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

let failed = 0;
const results = [];

try {
  await page.goto(`${base}/?smoke=1`, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForFunction(() => document.documentElement.getAttribute("data-smoke") === "ready", {
    timeout: 120000,
  });
  await page.evaluate(() => {
    const el = document.getElementById("nl-loading");
    if (el) {
      el.hidden = true;
      el.style.display = "none";
    }
  });
  console.log("smoke ready");

  await page.evaluate(() => {
    document.querySelector('button.nav-item[data-panel="tower"]')?.click();
  });
  await page.waitForFunction(() => document.querySelectorAll("[data-stage-quick]").length > 0, {
    timeout: 30000,
  });
  await page.evaluate(() => {
    document.querySelector("[data-stage-quick]")?.click();
  });

  // Đánh → modal xác nhận → Xuất quân (#brief-go)
  await page.waitForFunction(() => !!document.getElementById("brief-go"), { timeout: 15000 });
  // Đóng băng combat ngay sau spawn — chỉ skillFlash QA, không event playback
  await page.evaluate(() => {
    window.__NL_SKILL_QA__ = true;
  });
  await page.evaluate(() => {
    document.getElementById("brief-go")?.click();
  });
  console.log("clicked Xuất quân");

  await page.waitForFunction(
    () => {
      const ov = document.getElementById("combat-overlay");
      const v = window.NLCombatUI && window.NLCombatUI.getView && window.NLCombatUI.getView();
      return ov && !ov.hidden && v && v._battle3d && v._battle3d.fighters && v._battle3d.fighters.size > 0;
    },
    { timeout: 90000 }
  );
  console.log("battle3d ready");

  // Dừng playback combat + đóng băng unit motion; VFX vẫn tick
  await page.evaluate(() => {
    const v = window.NLCombatUI.getView();
    if (v) {
      v._playing = false;
      v._skip = true;
      if (v._battle3d) {
        v._battle3d.pausedForShot = true;
        if (typeof v._battle3d.clearFx === "function") v._battle3d.clearFx();
      }
    }
  });
  await page.waitForTimeout(200);

  for (const c of CASES) {
    const info = await page.evaluate((spec) => {
      const v = window.NLCombatUI.getView();
      const br = v && v._battle3d;
      if (!br) return { ok: false, reason: "no battle3d" };
      if (typeof br.clearFx === "function") br.clearFx();
      br.pausedForShot = true;
      const allies = [];
      const foes = [];
      br.fighters.forEach((f, uid) => {
        if (!f || f.dead) return;
        if (f.side === "ally") allies.push(uid);
        else foes.push(uid);
      });
      if (!allies.length) return { ok: false, reason: "no allies" };
      const caster = allies[0];
      let targets = foes.slice();
      if (spec.pattern === "single") targets = foes.slice(0, 1);
      if (spec.pattern === "self") targets = [caster];
      // Thời điểm peak = giữa emission (sau windup+cast)
      let waitMs = 420;
      try {
        const sd = window.NLSkillDesign;
        if (sd && sd.buildTimeline) {
          const tl = sd.buildTimeline(spec.flash);
          const em = (tl.steps || []).find((s) => s.phase === "emission");
          if (em) waitMs = Math.round(em.atMs + em.durationMs * 0.35);
          else {
            const cast = (tl.steps || []).find((s) => s.phase === "cast");
            waitMs = cast ? Math.round(cast.atMs + cast.durationMs * 0.6) : 400;
          }
        }
      } catch (_) {
        /* keep default */
      }
      try {
        br.skillFlash(caster, spec.flash, targets, {
          pattern: spec.pattern,
          quality: "purple",
          motif: spec.flash,
        });
        const canvas = document.querySelector("#combat-overlay canvas");
        return {
          ok: true,
          caster,
          targets: targets.length,
          hasCanvas: !!canvas,
          fighters: br.fighters.size,
          hasClearFx: typeof br.clearFx === "function",
          waitMs,
        };
      } catch (e) {
        return { ok: false, reason: String(e && e.message ? e.message : e) };
      }
    }, c);

    const waitMs = Math.max(280, Math.min(900, (info && info.waitMs) || 420));
    await page.waitForTimeout(waitMs);
    const shot = resolve(outDir, `${c.label}.png`);
    // Force 1 frame rồi toDataURL (cần preserveDrawingBuffer trên WebGLRenderer)
    const dataUrl = await page.evaluate(() => {
      const v = window.NLCombatUI && window.NLCombatUI.getView && window.NLCombatUI.getView();
      const br = v && v._battle3d;
      const c = document.querySelector("#combat-overlay canvas");
      if (!c) return null;
      try {
        if (br && br.renderer && br.scene && br.camera) {
          br.renderer.render(br.scene, br.camera);
        }
        return c.toDataURL("image/jpeg", 0.72);
      } catch {
        return null;
      }
    });
    if (dataUrl && dataUrl.startsWith("data:image")) {
      const b64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      const out = dataUrl.includes("jpeg") ? shot.replace(/\.png$/, ".jpg") : shot;
      writeFileSync(out, Buffer.from(b64, "base64"));
      if (out !== shot) {
        // giữ tên .png trong report bằng copy đường dẫn logic — ghi thêm png nhỏ via page clip
        writeFileSync(shot, Buffer.from(b64, "base64"));
      }
    } else {
      const box = await page.evaluate(() => {
        const c = document.querySelector("#combat-overlay canvas");
        if (!c) return null;
        const r = c.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      });
      if (box && box.width > 10) {
        await page.screenshot({ path: shot, clip: box, type: "jpeg", quality: 70, timeout: 20000 });
      } else {
        await page.screenshot({ path: shot, fullPage: false, type: "jpeg", quality: 70, timeout: 20000 });
      }
    }

    const pass = !!(info && info.ok && info.hasCanvas);
    if (!pass) failed++;
    results.push({ ...c, pass, info, shot });
    console.log(pass ? "PASS" : "FAIL", c.label, JSON.stringify(info));
  }
} catch (e) {
  failed++;
  console.error("FATAL", e);
  await page.screenshot({ path: resolve(outDir, "fatal.png") }).catch(() => {});
}

await browser.close();
const report = { failed, results, pageErrors: errors.slice(0, 20) };
writeFileSync(resolve(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log("\n— browser QA —", { failed, cases: results.length, outDir, pageErrors: errors.length });
process.exit(failed ? 1 : 0);
