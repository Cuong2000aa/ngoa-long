#!/usr/bin/env node
/**
 * Browser QA FULL catalog — bắn skillFlash cho MỌI chiêu trong skills.json.
 * - wave:true → emission ngay (không đợi windup/cast)
 * - assert có fx-sprite + màu material khớp flash
 * - chụp 1 ảnh/motif (visual proof)
 *
 * node scripts/browser-all-skills-vfx-qa.mjs [baseUrl]
 */
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] ?? "http://127.0.0.1:5173";
const outDir = resolve(ROOT, "docs/_shots/skill-qa-full");
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

/** Hex kỳ vọng theo flash (substring match trên material color) */
const FLASH_HEX = {
  wolf: ["fca5a5"],
  shield: ["ffe08a", "fde68a", "fff3c4", "fff7d6"],
  charge: ["d4b896", "c4a070", "e8d4b0", "b8956a"],
  rush: ["e2e8f0", "c4a882", "f8fafc", "ffe8c8"],
  whirlwind: ["a7f3d0", "6ee7b7"],
  dragon: ["ffb347", "ff8844"],
  snake: ["4ade80", "86efac", "22c55e", "a3e635"],
  yellow: ["fde68a", "fff3c4", "fbbf24"],
  yellow_cult: ["fde68a", "fff3c4"],
  gold: ["fde68a", "ffe08a", "fff3c4"],
  gold_soft: ["fde68a", "fff3c4"],
  gold_pierce: ["fde68a", "fff3c4"],
  gold_red: ["fca5a5", "fb7185", "ffb347"],
  blue_water: ["7dd3fc", "38bdf8"],
  cyan: ["7dd3fc", "38bdf8"],
  teal: ["7dd3fc", "38bdf8"],
  white_blue: ["7dd3fc", "38bdf8"],
  bagua: ["fde047", "67e8f9", "c4b5fd"],
  thunder: ["c4b5fd", "e9d5ff", "a78bfa"],
  crimson: ["fca5a5", "fb7185"],
  red: ["fca5a5", "fb7185"],
  dark_red: ["c4b5fd", "a78bfa", "fca5a5"],
  purple: ["c4b5fd", "a78bfa"],
  violet: ["c4b5fd", "a78bfa"],
  fire_rain: ["fb923c", "ff8844", "ea580c"],
  fire: ["fb923c", "ff8844", "ea580c"],
  red_fire: ["fb923c", "ff8844", "ea580c"],
  orange: ["fb923c", "ff8844", "fdba74"],
  tiger: ["fbbf24", "fdba74", "f59e0b"],
  steel: ["ffe8a0", "fff7ed", "ffe8c8", "e2e8f0"],
  white: ["ffe8a0", "fff7ed", "ffe8c8", "ffffff"],
  iron: ["ffe8a0", "fff7ed", "cbd5e1"],
  silver: ["ffe8a0", "fff7ed", "e2e8f0"],
  chain: ["ffe8a0", "fff7ed"],
  brown: ["d4b896", "c4a070"],
  blue: ["7dd3fc", "38bdf8", "60a5fa"],
  green_poison: ["4ade80", "22c55e", "a3e635", "86efac"],
  poison: ["4ade80", "22c55e", "a3e635", "86efac"],
  fire_green: ["4ade80", "22c55e", "a3e635"],
  pure: ["fde68a", "ffffff", "fff3c4"],
};

function collectSkills() {
  const raw = JSON.parse(readFileSync(resolve(ROOT, "data/skills.json"), "utf8"));
  const root = raw.skills || raw;
  const out = [];
  const walk = (o, key) => {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) {
      o.forEach((v, i) => walk(v, `${key}[${i}]`));
      return;
    }
    if (o.fx && typeof o.fx === "object" && (o.fx.flash || o.fx.motif)) {
      out.push({
        id: o.id || key,
        name: o.name || o.id || key,
        flash: String(o.fx.flash || "gold"),
        motif: String(o.fx.motif || ""),
        pattern: String(o.fx.pattern || o.pattern || "single"),
      });
    }
    for (const [k, v] of Object.entries(o)) {
      if (k === "fx") continue;
      walk(v, k);
    }
  };
  walk(root, "root");
  // dedupe by id
  const seen = new Set();
  return out.filter((s) => {
    const id = s.id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

let skills = collectSkills();
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
if (limitArg) {
  const n = Math.max(1, parseInt(limitArg.split("=")[1], 10) || skills.length);
  skills = skills.slice(0, n);
  console.log(`catalog skills=${skills.length} (limited)`);
} else {
  console.log(`catalog skills=${skills.length}`);
}

const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

let failed = 0;
const results = [];
const motifShot = new Set();

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

  await page.evaluate(() => {
    document.querySelector('button.nav-item[data-panel="tower"]')?.click();
  });
  await page.waitForFunction(() => document.querySelectorAll("[data-stage-quick]").length > 0, {
    timeout: 30000,
  });
  await page.evaluate(() => {
    document.querySelector("[data-stage-quick]")?.click();
  });
  await page.waitForFunction(() => !!document.getElementById("brief-go"), { timeout: 15000 });
  await page.evaluate(() => {
    window.__NL_SKILL_QA__ = true;
  });
  await page.evaluate(() => {
    document.getElementById("brief-go")?.click();
  });
  await page.waitForFunction(
    () => {
      const ov = document.getElementById("combat-overlay");
      const v = window.NLCombatUI && window.NLCombatUI.getView && window.NLCombatUI.getView();
      return ov && !ov.hidden && v && v._battle3d && v._battle3d.fighters && v._battle3d.fighters.size > 0;
    },
    { timeout: 90000 }
  );
  console.log("battle3d ready — firing all skills");

  await page.evaluate(() => {
    const v = window.NLCombatUI.getView();
    if (v) {
      v._playing = false;
      v._skip = true;
      if (v._battle3d) v._battle3d.pausedForShot = false;
    }
  });

  // Inject catalog + hex map first (tránh evaluate payload khổng lồ treo CDP)
  await page.evaluate(
    ({ specs, flashHex }) => {
      window.__NL_SKILL_QA_SPECS__ = specs;
      window.__NL_SKILL_QA_HEX__ = flashHex;
    },
    { specs: skills, flashHex: FLASH_HEX }
  );
  console.log("catalog injected");

  // Runner chạy trong page event loop (không await sleep trong Playwright evaluate — dễ treo CDP)
  const runnerInfo = await page.evaluate(() => {
    const specs = window.__NL_SKILL_QA_SPECS__ || [];
    const flashHex = window.__NL_SKILL_QA_HEX__ || {};
    const state = {
      specs,
      flashHex,
      i: 0,
      results: [],
      done: false,
      failed: 0,
      startedAt: performance.now(),
      progress: `0/${specs.length}`,
    };
    window.__NL_SKILL_QA_RUN__ = state;
    const br = window.NLCombatUI.getView()._battle3d;
    const allies = [];
    const foes = [];
    br.fighters.forEach((f, uid) => {
      if (!f || f.dead) return;
      if (f.side === "ally") allies.push(uid);
      else foes.push(uid);
    });
    const caster = allies[0];

    const step = () => {
      if (state.i >= specs.length) {
        state.done = true;
        state.ms = performance.now() - state.startedAt;
        state.progress = `${state.i}/${specs.length} failed=${state.failed}`;
        return;
      }
      const spec = specs[state.i++];
      const expect = flashHex[spec.flash] || flashHex[spec.motif] || null;
      if (state.i === 1 || state.i % 8 === 0) {
        try {
          br.clearFx();
        } catch (_) {
          /* ignore */
        }
      }
      let targets = foes.slice();
      const pat = (spec.pattern || "single").toLowerCase();
      if (pat === "single") targets = foes.slice(0, 1);
      if (pat === "self") targets = [caster];
      if (pat === "ally_all") targets = allies.slice();
      let flashOk = true;
      let reason = null;
      const bornBefore = performance.now();
      try {
        if (!caster) throw new Error("no allies");
        br.skillFlash(caster, spec.flash, targets, {
          pattern: spec.pattern,
          quality: "purple",
          motif: spec.motif || spec.flash,
          wave: true,
        });
      } catch (e) {
        flashOk = false;
        reason = String(e && e.message ? e.message : e);
      }
      // Đợi playSheet(loadTex) trên event loop trang
      setTimeout(() => {
        try {
          const colors = [];
          let n = 0;
          let nNew = 0;
          if (flashOk && br.scene) {
            br.scene.traverse((o) => {
              if (!(o && o.name === "fx-sprite")) return;
              n++;
              const born = o.userData && o.userData.born;
              if (born != null && born >= bornBefore - 20) nNew++;
              if (o.material && o.material.color) colors.push(o.material.color.getHexString());
            });
          }
          const fxN = nNew || n;
          const joined = colors.join(",").toLowerCase();
          const colorOk = !expect || expect.some((h) => joined.includes(String(h).toLowerCase()));
          const pass = !!(flashOk && fxN > 0 && colorOk);
          if (!pass) state.failed++;
          state.results.push({
            id: spec.id,
            name: spec.name,
            flash: spec.flash,
            motif: spec.motif,
            pattern: spec.pattern,
            pass,
            fxN,
            colors: colors.slice(0, 8),
            reason: !flashOk
              ? reason
              : !fxN
                ? "no fx-sprite"
                : !colorOk
                  ? `color miss expect=${expect}`
                  : null,
          });
        } catch (err) {
          state.failed++;
          state.results.push({
            id: spec.id,
            name: spec.name,
            flash: spec.flash,
            motif: spec.motif,
            pattern: spec.pattern,
            pass: false,
            fxN: 0,
            colors: [],
            reason: "probe:" + String(err && err.message ? err.message : err),
          });
        }
        if (state.i % 25 === 0 || state.i >= specs.length) {
          state.progress = `${state.i}/${specs.length} failed=${state.failed}`;
        }
        setTimeout(step, 0);
      }, 180);
    };
    setTimeout(step, 0);
    return { started: true, total: specs.length, allies: allies.length, foes: foes.length };
  });
  console.log("runner", JSON.stringify(runnerInfo));

  // Poll tiến độ (không evaluate nặng — chỉ đọc flag)
  let lastProg = "";
  const pollStart = Date.now();
  for (;;) {
    const st = await page.evaluate(() => {
      const s = window.__NL_SKILL_QA_RUN__;
      if (!s) return { done: true, error: "no run state" };
      return {
        done: !!s.done,
        i: s.i,
        total: (s.specs && s.specs.length) || 0,
        failed: s.failed,
        progress: s.progress || "",
        ms: s.ms || 0,
      };
    });
    if (st.error) {
      console.error("runner error", st.error);
      break;
    }
    if (st.progress && st.progress !== lastProg) {
      console.log("…", st.progress);
      lastProg = st.progress;
    } else if (!st.done && Date.now() - pollStart > 3000 && st.i === 0) {
      console.log("waiting — i still 0, elapsed", Date.now() - pollStart);
    }
    if (st.done) {
      console.log(`catalog done in ${Math.round(st.ms || 0)}ms`);
      break;
    }
    if (Date.now() - pollStart > 400000) {
      console.error("FATAL poll timeout");
      break;
    }
    await page.waitForTimeout(400);
  }

  const catalogRows = await page.evaluate(() => window.__NL_SKILL_QA_RUN__.results || []);
  for (const row of catalogRows) {
    if (!row.pass) failed++;
    results.push(row);
  }

  // Pass 2: visual proof — 1 shot / motif (không chụp 590 lần)
  const motifReps = [];
  const seenM = new Set();
  for (const s of skills) {
    const m = s.motif || s.flash;
    if (seenM.has(m)) continue;
    seenM.add(m);
    motifReps.push(s);
  }
  console.log(`visual pass — ${motifReps.length} motifs`);
  for (const s of motifReps) {
    await page.evaluate((spec) => {
      const br = window.NLCombatUI.getView()._battle3d;
      br.clearFx();
      br.pausedForShot = false;
      const allies = [];
      const foes = [];
      br.fighters.forEach((f, uid) => {
        if (!f || f.dead) return;
        if (f.side === "ally") allies.push(uid);
        else foes.push(uid);
      });
      const caster = allies[0];
      let targets = foes.slice();
      const pat = (spec.pattern || "single").toLowerCase();
      if (pat === "single") targets = foes.slice(0, 1);
      if (pat === "self") targets = [caster];
      if (pat === "ally_all") targets = allies.slice();
      br.skillFlash(caster, spec.flash, targets, {
        pattern: spec.pattern,
        quality: "purple",
        motif: spec.motif || spec.flash,
        wave: true,
      });
    }, s);
    await page.waitForTimeout(220);
    await page.evaluate(() => {
      const br = window.NLCombatUI.getView()._battle3d;
      if (br.renderer && br.scene && br.camera) br.renderer.render(br.scene, br.camera);
    });
    const motifKey = s.motif || s.flash;
    const shot = resolve(outDir, `motif-${motifKey}.jpg`);
    await page.screenshot({ path: shot, fullPage: false, type: "jpeg", quality: 70, timeout: 20000 });
    motifShot.add(motifKey);
    console.log("SHOT", motifKey);
  }
} catch (e) {
  failed++;
  console.error("FATAL", e);
  await page.screenshot({ path: resolve(outDir, "fatal.png") }).catch(() => {});
}

await browser.close();

const byMotif = {};
for (const r of results) {
  const m = r.motif || "?";
  byMotif[m] = byMotif[m] || { total: 0, pass: 0, fail: 0 };
  byMotif[m].total++;
  if (r.pass) byMotif[m].pass++;
  else byMotif[m].fail++;
}

const fails = results.filter((r) => !r.pass);
const report = {
  failed,
  total: results.length,
  passed: results.length - failed,
  pageErrors: pageErrors.slice(0, 20),
  byMotif,
  fails: fails.slice(0, 80),
  motifShots: [...motifShot],
};
writeFileSync(resolve(outDir, "report-full.json"), JSON.stringify(report, null, 2));
writeFileSync(resolve(outDir, "results-all.json"), JSON.stringify(results, null, 2));

console.log("\n— full catalog browser QA —", {
  total: report.total,
  passed: report.passed,
  failed: report.failed,
  motifs: Object.keys(byMotif).length,
  shots: motifShot.size,
  outDir,
});
if (fails.length) {
  console.log("sample fails:");
  fails.slice(0, 15).forEach((f) => console.log(" FAIL", f.id, f.flash, f.pattern, f.reason, f.colors));
}
process.exit(failed ? 1 : 0);
