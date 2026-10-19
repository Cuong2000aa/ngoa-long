#!/usr/bin/env node
/**
 * QA pipeline chiêu — Phase 1/2/3
 * Chạy: node scripts/test-skill-pipeline.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;
let passed = 0;

function ok(cond, msg) {
  if (cond) {
    passed++;
    console.log("PASS —", msg);
  } else {
    failed++;
    console.error("FAIL —", msg);
  }
}

const skills = JSON.parse(fs.readFileSync(path.join(ROOT, "data/skills.json"), "utf8")).skills;
const status = JSON.parse(fs.readFileSync(path.join(ROOT, "data/status-effects.json"), "utf8"));
const profiles = status.combatProfiles || {};

// —— Phase 1: false heal ——
let falseHeal = 0;
for (const s of Object.values(skills)) {
  const desc = (s.desc || "").toLowerCase();
  const hasHeal = (s.effects || []).some((e) => e.type === "heal_pct");
  if (!hasHeal) continue;
  const troop =
    desc.includes("trị liệu") ||
    /hồi\s*(phục\s*)?(lính|binh|sinh\s*lực|khí\s*huyết)/.test(desc) ||
    (desc.includes("hồi phục") && !desc.includes("sĩ khí"));
  if (!troop && desc.includes("sĩ khí")) falseHeal++;
}
ok(falseHeal === 0, `không còn false heal sĩ khí→máu (got ${falseHeal})`);

// —— Lang Tuyền (Bàng Đức) ——
const lt = skills.lang_tuyen;
ok(!!lt, "có skill lang_tuyen");
if (lt) {
  ok(lt.pattern === "column", `lang_tuyen pattern=column (got ${lt.pattern})`);
  ok((lt.hits || 1) >= 2, `lang_tuyen hits>=2 (got ${lt.hits})`);
  ok(lt.fx?.motif === "wolf", `lang_tuyen motif=wolf (got ${lt.fx?.motif})`);
  const types = (lt.effects || []).map((e) => e.type);
  ok(types.includes("def_up"), "lang_tuyen có Thiết Bích (def_up)");
  ok(types.includes("morale_boost"), "lang_tuyen có hồi sĩ khí");
  ok(!types.includes("heal_pct"), "lang_tuyen KHÔNG heal máu giả");
}

const nt = skills.nghich_tap;
ok(!!nt && nt.fx?.motif === "rush", `nghich_tap motif=rush (got ${nt?.fx?.motif})`);

const dx = skills.dong_xoay;
ok(!!dx && dx.fx?.motif === "whirlwind", `dong_xoay motif=whirlwind (got ${dx?.fx?.motif})`);

// —— brackets coverage ——
const skip = new Set([
  "thường", "chiến", "thần", "truyền thuyết", "thần hoàng", "thượng cổ", "thái sơ",
  "c.pháp", "kế sách", "hỗ trợ", "bị động", "vật lý", "chiến+kế",
]);
let unmappedReal = 0;
for (const s of Object.values(skills)) {
  const desc = s.desc || "";
  for (const m of desc.matchAll(/\[([^\]]+)\]/g)) {
    const key = m[1].trim().toLowerCase();
    if (skip.has(key)) continue;
    if (/^\d+\s*sĩ\s*khí/i.test(key) || /thi triển/i.test(key)) continue;
    if (key.length > 40) continue;
    // nếu skill có bất kỳ effect nào từ bracket này — khó check; chỉ đếm bracket không có trong catalog
    const inCat = (status.wikiCatalog || []).some(
      (c) => (c.name || "").toLowerCase() === key || (c.name || "").toLowerCase() === key.replace(/\s*2$/, "")
    );
    const hasEff = (s.effects || []).length > 0;
    if (inCat && !hasEff) unmappedReal++;
  }
}
ok(unmappedReal < 15, `skills có bracket catalog nhưng effects rỗng < 15 (got ${unmappedReal})`);

// —— Thiết Bích → shield motif khi tên/chiêu hộ ——
let shieldOk = 0;
let shieldTotal = 0;
for (const s of Object.values(skills)) {
  const n = (s.name || "").toLowerCase();
  if (!n.includes("thiết bích")) continue;
  shieldTotal++;
  if (s.fx?.motif === "shield") shieldOk++;
}
ok(shieldTotal === 0 || shieldOk === shieldTotal, `chiêu tên Thiết Bích → motif shield (${shieldOk}/${shieldTotal})`);

// —— Phase 2: combatProfiles ——
ok(Object.keys(profiles).length >= 200, `combatProfiles >= 200 (got ${Object.keys(profiles).length})`);
ok(!!profiles.hoi_tam?.atkMul, "profile hoi_tam có atkMul");
ok(!!profiles.treo_thuong?.atkDown || !!profiles.treo_thuong?.defDown, "profile treo_thuong có debuff");
ok(profiles.me_hoac?.stun === true, "profile me_hoac stun");

// skills dùng wiki_buff phải có profile id
let missingProf = 0;
const missingIds = new Set();
for (const s of Object.values(skills)) {
  for (const e of s.effects || []) {
    if (e.type !== "wiki_buff" && e.type !== "wiki_debuff") continue;
    if (!e.id) continue;
    if (!profiles[e.id]) {
      missingProf++;
      missingIds.add(e.id);
    }
  }
}
ok(missingProf === 0, `mọi wiki_buff id có combatProfile (missing ${[...missingIds].slice(0, 8).join(",") || "∅"})`);

// —— Phase 3: motif dedicated resolve ——
const designSrc = fs.readFileSync(path.join(ROOT, "js/combat/skill-design.js"), "utf8");
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(designSrc, sandbox);
const Design = sandbox.window.NLSkillDesign;
ok(!!Design, "NLSkillDesign loaded");
ok(Design.resolveFxKey({ flash: "steel", motif: "rush" }) === "rush", "rush thắng steel");
ok(Design.resolveFxKey({ flash: "gold_soft", motif: "shield" }) === "shield", "shield wins");
ok(Design.resolveFxKey({ flash: "steel", motif: "wolf" }) === "wolf", "wolf wins");

const motifCount = {};
for (const s of Object.values(skills)) {
  const m = s.fx?.motif || "?";
  motifCount[m] = (motifCount[m] || 0) + 1;
}
ok((motifCount.slash || 0) < 230, `slash không chiếm quá nhiều (got ${motifCount.slash})`);
ok((motifCount.rush || 0) >= 5, `rush >= 5 (got ${motifCount.rush})`);
ok((motifCount.charge || 0) >= 8, `charge >= 8 Kỵ* (got ${motifCount.charge})`);
ok((motifCount.wolf || 0) >= 2, `wolf >= 2 (got ${motifCount.wolf})`);
ok(skills.ky_liep?.fx?.motif === "charge", `ky_liep motif=charge (got ${skills.ky_liep?.fx?.motif})`);
ok(skills.lang_tuyen?.fx?.style === "column_pierce" || skills.lang_tuyen?.pattern === "column", "lang_tuyen style/pattern column");
ok(skills.thiet_bich?.fx?.style === "barrier" || skills.thiet_bich?.fx?.motif === "shield", "thiet_bich barrier/shield");
ok(skills.ky_liep?.fx?.style === "cavalry_charge", `ky_liep style=cavalry_charge (got ${skills.ky_liep?.fx?.style})`);
ok(skills.dot_kich?.fx?.style === "rush_assault", `dot_kich style=rush_assault (got ${skills.dot_kich?.fx?.style})`);

// Secondary target desc (hàng sau) — Lang Tuyền thần
const enginePath = path.join(ROOT, "js/combat/combat-engine.js");
const engSrc = fs.readFileSync(enginePath, "utf8");
ok(engSrc.includes("resolveSecondaryTargets"), "engine có resolveSecondaryTargets");
ok(engSrc.includes("hàng\\s*sau") || engSrc.includes("hàng sau") || /hàng\\s\*sau/.test(engSrc), "engine parse hàng sau");

// —— Combat engine: wiki_buff ảnh hưởng dame ——
const engineSrc = fs.readFileSync(path.join(ROOT, "js/combat/combat-engine.js"), "utf8");
const NL_DB = {
  statusEffects: {
    effects: status.effects || {},
    wikiCatalog: status.wikiCatalog || [],
    combatProfiles: profiles,
  },
  formulas: {
    combat: {},
    morale: {
      start: 100,
      max: 100,
      gainOnAttack: 25,
      gainOnHit: 15,
      skillThreshold: 100,
      resetAfterSkill: 0,
    },
  },
  troops: { types: { infantry: { id: "infantry", range: "melee", beats: "spear" } } },
  formations: {
    defaultId: "crane_wing",
    list: { crane_wing: { id: "crane_wing" }, square: { id: "square" } },
  },
  skills: { skills },
};
const NLDatabase = {
  statusEffects: () => NL_DB.statusEffects,
  formulas: () => NL_DB.formulas,
  getTroop: (id) => NL_DB.troops.types[id] || null,
  getSkill: (id) => skills[id] || null,
  raw: () => NL_DB,
};
const combatBox = { window: {}, console, Math, NL_DB, NLDatabase };
combatBox.window.NL_DB = NL_DB;
combatBox.window.NLDatabase = NLDatabase;
vm.createContext(combatBox);
vm.runInContext(engineSrc, combatBox);
const Combat = combatBox.window.NLCombat || combatBox.NLCombat;
ok(!!Combat && typeof Combat.runBattle === "function", "NLCombat.runBattle available");

function unit(name, extra) {
  return Object.assign(
    {
      id: name,
      name,
      troop: "infantry",
      vuLuc: 80,
      tongLinh: 40,
      triLuc: 30,
      hp: 2000,
      quality: "blue",
      skillId: "lang_tuyen",
      skill: skills.lang_tuyen,
      slot: 0,
    },
    extra || {}
  );
}

if (Combat) {
  // morale cao để chắc chắn ra chiêu
  const result = Combat.runBattle(
    [unit("A", { vuLuc: 90 })],
    [unit("B", { skillId: null, skill: null, tongLinh: 20 })],
    { title: "QA lang_tuyen" }
  );
  const evs = (result && (result.events || result.uiEvents)) || [];
  ok(!!result && Array.isArray(evs), "battle trả events");
  ok(evs.length > 0, `battle có events (${evs.length})`);
  const skillEv = evs.filter((ev) => ev.type === "skill");
  ok(skillEv.length >= 1, `có skill event (got ${skillEv.length})`);
  if (skillEv.length) {
    ok(
      skillEv.some((s) => s.motif === "wolf" || s.flash === "wolf"),
      `skill event motif/flash wolf (got ${skillEv[0].motif}/${skillEv[0].flash})`
    );
  }
  const statusEv = evs.filter((ev) => ev.type === "status");
  const hasThietBich = statusEv.some((ev) =>
    (ev.statuses || []).some((st) => {
      const lab = String(st.label || "");
      return st.id === "def_up" && /^thiế/i.test(lab);
    })
  );
  ok(hasThietBich, `Thiết Bích (def_up/Thiế…) trên status UI (n=${statusEv.length})`);
}

// Python semantics unit checks
const py = spawnSync(
  "python3",
  [
    "-c",
    `
import sys
sys.path.insert(0,'scripts')
from lib_skill_semantics import effects_from_desc, infer_pattern, infer_motif_flash, build_full_name_map
nm=build_full_name_map()
desc='[C.Pháp] Địch trên hàng dọc chịu 2 lần 360% Pháp Công, bản thân nhận [Thiết Bích], duy trì 1 lượt, bản thân hồi 50+{6} sĩ khí.'
eff=effects_from_desc(desc,nm)
types=[e['type'] for e in eff]
assert 'def_up' in types, types
assert 'morale_boost' in types, types
assert 'heal_pct' not in types, types
assert infer_pattern(desc)=='column'
m,f=infer_motif_flash('Lang Tuyền', desc, 'column')
assert m=='wolf' and f=='wolf', (m,f)
m2,f2=infer_motif_flash('Nghịch Tập', 'Gây cho 1 kẻ địch 150% Pháp Công', 'single')
assert m2=='rush', (m2,f2)
print('py_ok')
`,
  ],
  { cwd: ROOT, encoding: "utf-8" }
);
ok(py.status === 0 && (py.stdout || "").includes("py_ok"), `python semantics checks (${py.stderr || py.stdout || ""})`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
