#!/usr/bin/env node
/**
 * Kiểm thử coverage hiệu ứng chiêu:
 * - mọi flash trong skills.json có profile (skill-design BY_FLASH)
 * - motif dedicated resolve đúng
 * - sheet path trong battleVfx TEX tồn tại
 * - không remap lỗ hổng (flash lạ)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

// —— Load NLSkillDesign in VM ——
const designSrc = fs.readFileSync(path.join(ROOT, "js/combat/skill-design.js"), "utf8");
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(designSrc, sandbox);
const Design = sandbox.window.NLSkillDesign;
ok(!!Design, "NLSkillDesign loaded");

const byFlash = Object.keys(Design.BY_FLASH || {});
ok(byFlash.length >= 20, `BY_FLASH keys >= 20 (got ${byFlash.length})`);

// —— skills.json flash coverage ——
const skills = JSON.parse(fs.readFileSync(path.join(ROOT, "data/skills.json"), "utf8"));
const flashes = new Map();
const motifs = new Map();

function walk(obj) {
  if (!obj || typeof obj !== "object") return;
  if (obj.fx && typeof obj.fx === "object") {
    const f = obj.fx.flash || "(none)";
    const m = obj.fx.motif || "(none)";
    flashes.set(f, (flashes.get(f) || 0) + 1);
    motifs.set(m, (motifs.get(m) || 0) + 1);
  }
  for (const v of Object.values(obj)) {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") walk(v);
  }
}
walk(skills);

const missingProfiles = [];
for (const [f, n] of flashes) {
  if (f === "(none)") continue;
  if (!Design.BY_FLASH[f]) missingProfiles.push(`${f}×${n}`);
}
ok(missingProfiles.length === 0, `mọi flash skills.json có BY_FLASH (missing: ${missingProfiles.join(", ") || "∅"})`);

// —— Motif resolve ——
ok(Design.resolveFxKey({ flash: "steel", motif: "tiger" }) === "tiger", "motif tiger thắng flash steel");
ok(Design.resolveFxKey({ flash: "blue", motif: "dragon" }) === "dragon", "motif dragon thắng flash blue");
ok(Design.resolveFxKey({ flash: "steel", motif: "slash" }) === "steel", "motif slash giữ flash steel");
ok(Design.resolveFxKey({ flash: "gold_soft", motif: "heal" }) === "gold_soft", "heal giữ gold_soft");
ok(Design.resolveFxKey({ flash: "gold_soft", motif: "shield" }) === "shield", "shield motif → flash shield");
ok(Design.resolve("tiger").visual === "roar", "tiger profile visual=roar");
ok(Design.resolve("whirlwind").essence === "wind", "whirlwind essence=wind");
ok(Design.resolve("steel").movement === "thrust", "steel movement=thrust");
ok(Design.resolve("wolf").movement === "lunge", "wolf movement=lunge");
ok(Design.resolveFxKey({ flash: "steel", motif: "charge" }) === "charge", "motif charge thắng steel");
ok(Design.resolve("charge").movement === "lunge", "charge profile movement=lunge");
ok(Design.BY_FLASH.charge != null, "BY_FLASH có charge");

const kyLiep = skills.skills?.ky_liep || skills.ky_liep;
ok(kyLiep && kyLiep.fx && kyLiep.fx.flash === "charge" && kyLiep.fx.motif === "charge", "Kỵ Liệp fx=charge");

const thiet = skills.skills?.thiet_bich || skills.thiet_bich;
ok(thiet && thiet.fx && thiet.fx.flash === "shield" && thiet.fx.motif === "shield", "Thiết Bích fx=shield");
const dot = skills.skills?.dot_kich || skills.dot_kich;
ok(dot && dot.fx && dot.fx.flash === "rush" && dot.fx.motif === "rush", "Đột Kích fx=rush");
ok(Design.resolve("shield").delivery === "buff", "shield profile delivery=buff");
ok(Design.resolve("rush").movement === "thrust", "rush profile movement=thrust");
ok(Design.resolveFxKey({ flash: "steel", motif: "rush" }) === "rush", "motif rush thắng steel");

// —— Dedicated motifs all resolve to BY_FLASH ——
const badMotif = [];
for (const [m, flash] of Object.entries(Design.MOTIF_DEDICATED_FLASH)) {
  if (!Design.BY_FLASH[flash]) badMotif.push(`${m}→${flash}`);
}
ok(badMotif.length === 0, `MOTIF_DEDICATED → BY_FLASH (bad: ${badMotif.join(", ") || "∅"})`);

// —— battleVfx asset paths ——
const vfxSrc = fs.readFileSync(path.join(ROOT, "src/battle/battleVfx.ts"), "utf8");
const assetRe = /"assets\/fx\/[^"]+\.png"/g;
const assets = [...new Set((vfxSrc.match(assetRe) || []).map((s) => s.slice(1, -1)))];
const missingFiles = [];
for (const rel of assets) {
  if (!fs.existsSync(path.join(ROOT, rel))) missingFiles.push(rel);
}
ok(assets.length > 40, `battleVfx tham chiếu >= 40 sheet (got ${assets.length})`);
ok(missingFiles.length === 0, `mọi path assets/fx tồn tại (missing ${missingFiles.length}: ${missingFiles.slice(0, 5).join(", ") || "∅"})`);

// —— Cavalry charge export ——
ok(vfxSrc.includes("spawnCavalryCharge"), "spawnCavalryCharge có trong battleVfx");
ok(vfxSrc.includes("TEX.dirt"), "dirt particles cho vó ngựa");
ok(vfxSrc.includes("spawnShieldBarrier"), "spawnShieldBarrier có trong battleVfx");
ok(vfxSrc.includes("spawnRushAssault"), "spawnRushAssault có trong battleVfx");
ok(vfxSrc.includes("spawnPremiumImpact"), "spawnPremiumImpact có trong battleVfx");
ok(vfxSrc.includes("spawnSkillWindup"), "spawnSkillWindup có trong battleVfx");
ok(vfxSrc.includes("fxScaleMul"), "fxScaleMul S/M/L có trong battleVfx");
ok(vfxSrc.includes("spawnColumnStrike"), "spawnColumnStrike (hàng dọc)");
ok(vfxSrc.includes("spawnRowSweep"), "spawnRowSweep (hàng ngang)");
ok(vfxSrc.includes("spawnAoENova"), "spawnAoENova (toàn địch)");
ok(vfxSrc.includes("spawnAllyBless"), "spawnAllyBless (phe ta)");
ok(vfxSrc.includes("spawnPatternEmission"), "spawnPatternEmission router");
ok(vfxSrc.includes("clearBattleVfx"), "clearBattleVfx cho QA");
ok(!/spawnRowSweep[\s\S]{0,600}0xfffbeb/.test(vfxSrc), "row sweep không cream-wash motif");

// —— BattleRenderer không remap gold → fire ——
const br = fs.readFileSync(path.join(ROOT, "src/battle/BattleRenderer.ts"), "utf8");
ok(!/flash\s*!==\s*["']gold["']/.test(br), "BattleRenderer không còn remap flash!==gold");
ok(br.includes("spawnCavalryCharge"), "BattleRenderer gọi cavalry charge");
ok(br.includes("wave?:"), "skillFlash hỗ trợ opts.wave");
ok(br.includes('atkTroop === "spear"'), "tấn công thường thương có FX riêng");
ok(br.includes("isShield") || br.includes('kind === "shield"'), "BattleRenderer xử lý shield");
ok(br.includes("isRush") || br.includes('kind === "rush"'), "BattleRenderer xử lý rush");
ok(br.includes("playTimeline"), "BattleRenderer chạy skill timeline");
ok(br.includes("triggerCamPunch") || br.includes("camPunch"), "BattleRenderer có camera punch");
ok(br.includes("hitStopUntil"), "BattleRenderer có hit-stop");
ok(br.includes("spawnPatternEmission"), "BattleRenderer gọi spawnPatternEmission");
ok(br.includes("qualityToScale"), "BattleRenderer scale theo phẩm");
ok(br.includes("pattern?:"), "SkillFlashOpts có pattern");
ok(br.includes("clearFx"), "BattleRenderer.clearFx");
ok(br.includes("pausedForShot"), "BattleRenderer.pausedForShot");
ok(br.includes("playSkillFx3d"), "BattleRenderer gọi playSkillFx3d (polished 3D)");
ok(br.includes("tickBattleVfx3d"), "BattleRenderer tick 3D VFX");
ok(br.includes("skillId?:"), "SkillFlashOpts có skillId");
ok(br.includes("usesPolishedSteelSlash"), "BattleRenderer gate polished theo skillId");
ok(br.includes("usesPolishedDragon"), "BattleRenderer gate polished dragon");
ok(br.includes("usesPolishedTiger"), "BattleRenderer gate polished tiger");
ok(br.includes("usesPolishedRush"), "BattleRenderer gate polished rush");

// —— skillFxLibrary ——
const libPath = path.join(ROOT, "src/battle/skillFxLibrary.ts");
ok(fs.existsSync(libPath), "skillFxLibrary.ts tồn tại");
const libSrc = fs.readFileSync(libPath, "utf8");
ok(libSrc.includes("spawnWeaponTrail"), "library có spawnWeaponTrail");
ok(libSrc.includes("spawnGroundSigil"), "library có spawnGroundSigil");
ok(libSrc.includes("spawnSparkDebris"), "library có spawnSparkDebris");
ok(libSrc.includes("playSteelSlashSkill"), "library có playSteelSlashSkill");
ok(libSrc.includes("playDragonBreathSkill"), "library có playDragonBreathSkill");
ok(libSrc.includes("playTigerRoarSkill"), "library có playTigerRoarSkill");
ok(libSrc.includes("playRushAssaultSkill"), "library có playRushAssaultSkill");
ok(libSrc.includes("spawnFlyingFx"), "library dùng spawnFlyingFx cho rồng bay");
ok(libSrc.includes('basic_strike'), "library whitelist basic_strike");
ok(libSrc.includes("basic_strike_chien"), "library whitelist basic_strike_chien (phẩm Chiến)");
ok(libSrc.includes("hoa_long"), "library whitelist hoa_long (Hỏa Long)");
ok(libSrc.includes("ho_khieu"), "library whitelist ho_khieu (Hổ Khiếu)");
ok(libSrc.includes("dot_kich"), "library whitelist dot_kich (Đột Kích)");
ok(vfxSrc.includes("spawnFxSheet"), "battleVfx export spawnFxSheet cho library");
ok(vfxSrc.includes("export function spawnFlyingFx"), "battleVfx export spawnFlyingFx");
const libAssets = [...new Set((libSrc.match(assetRe) || []).map((s) => s.slice(1, -1)))];
const libMissing = libAssets.filter((rel) => !fs.existsSync(path.join(ROOT, rel)));
ok(libMissing.length === 0, `skillFxLibrary assets tồn tại (missing: ${libMissing.slice(0, 5).join(", ") || "∅"})`);

// —— combat-ui wave flag ——
const ui = fs.readFileSync(path.join(ROOT, "js/combat/combat-ui.js"), "utf8");
ok(ui.includes("wave: true") || ui.includes("wave:!0") || ui.includes('{ wave: true }'), "combat-ui skill_wave truyền wave:true");
ok(ui.includes("skillId: ev.skillId"), "combat-ui truyền skillId vào skillFlash");

// —— Mọi BY_FLASH có case auraRecipe hoặc nhóm default vật lý ——
const recipeCases = new Set([...vfxSrc.matchAll(/case\s+"([^"]+)":/g)].map((m) => m[1]));
const physicalDefault = new Set(["white", "steel", "iron", "silver", "chain", "brown"]);
const noRecipe = byFlash.filter((f) => !recipeCases.has(f) && !physicalDefault.has(f));
ok(noRecipe.length === 0, `BY_FLASH có auraRecipe/default (thiếu: ${noRecipe.join(", ") || "∅"})`);

// —— Phe: skill theo phẩm — tên chiêu ↔ flash (rule cứng) ——
const gens = JSON.parse(fs.readFileSync(path.join(ROOT, "data/generals.json"), "utf8"));
const glist = gens.list || gens;
const skillMap = skills.skills || skills;
const Q = ["white", "green", "blue", "purple", "orange", "red", "gold"];
function expectNamedFx(name) {
  const n = name || "";
  // Thứ tự quan trọng: compound (Phong Tiễn / Hỏa Long Tiễn) trước Tiễn generic
  const rules = [
    [/Giáp|Thiết Bích|Hộ Thể|Thủ Hộ|Lấy Thân Làm Giáp|Hãn Vệ/i, "shield"],
    [/Đột Kích|Tập Kích|Xung Phong|Nghịch Tập|Đột Tiến|Đột Tập|Cường Tập|Nộ Tập|Tật Xung/i, "rush"],
    [/Kỵ Liệp|Kỵ Kích|Kỵ Chiến|Chiến Kỵ|Đơn Kỵ|Thiết Kỵ|Nhất Kỵ|Thiên Lý Đơn Kỵ|Bạch Kỵ/i, "charge"],
    [/Phong Tiễn/i, "whirlwind"],
    [/Hỏa Long Tiễn|Long Tiễn/i, "dragon"],
    [/Hỏa .{0,6}Tiễn|Viêm .{0,4}Tiễn/i, "fire_rain"],
    [/Lôi Tiễn|Kinh Lôi|Lôi Kích|Thần Lôi|Xích Lôi|Tử Điện|Lôi Oanh|Cửu Thiên Thần Lôi|Kinh Thiên Bạo Lôi|Cửu Tiêu Thần Lôi/i, "thunder"],
    [/Tiễn|Nghệ Xạ|Thần Xạ|Mũi Nhọn|Liệt Thỉ|Thỉ$|Tề Xạ|Xạ Sát|Phi Xạ|Liên Nỏ|Kỵ Xạ|Xạ Thủ|Kình Nỏ|Giương Cung/i, "yellow"],
    [/Lang |Sói/i, "wolf"],
    [/Hổ Khiếu|Hổ Bôn|Hùng Hổ|Hổ Xung|Hổ Sát|Mãnh Hổ|Hổ Tri|Triệu Hổ/i, "tiger"],
    [/Thanh Long|Bạch Long|Ngân Long|Thiên Long|Phục Long|Đằng Long|Địa Long|Trời Long|Hỏa Long/i, "dragon"],
    [/Thiên Hỏa|Hỏa Vũ|Hỏa Ngưu|Hỏa Thiêu|Hỏa Thần|Đại Viêm|Hồng Viêm|Hắc Viêm|Luyện Ngục|Xích Lửa|Lửa Lục|Hỏa /i, "fire_rain"],
    [/Độc Địa|Độc Xà|Độc Tiêu|Xà Độc|Độc /i, "green_poison"],
    [/Bát Trận|Kỳ Môn|Phá Trận|Ngũ Hành/i, "bagua"],
    [/Lạc Thủy|Thủy Chiến|Hồng Thủy|Vũ Thánh|Thiên Vũ|Phượng Vũ/i, "blue_water"],
    [/Gió Lốc|Dòng Xoáy|Lướt Nhanh Như Gió|Cuồng Phong|Phong Lôi|Đông Phong|Thần Phong|Băng Phong|Phong Hầu|Uy Phong|Tang Phong/i, "whirlwind"],
    [/Kỳ Mưu|Ẩn Mưu|Quỷ Cốc|Định Kế/i, "purple"],
    [/Huyết Chiến|Huyết Quỷ|Nộ Sát|Quỷ Sát|Bác Sát/i, "crimson"],
  ];
  for (const [re, flash] of rules) if (re.test(n)) return flash;
  return null;
}
function namedFxOk(fx, want) {
  const flash = (fx && fx.flash) || "";
  const motif = (fx && fx.motif) || "";
  if (want === "charge") return flash === "charge" || motif === "charge";
  if (want === "rush") return flash === "rush" || motif === "rush";
  if (want === "shield") return flash === "shield" || motif === "shield";
  if (want === "yellow") return flash === "yellow" || flash === "thunder";
  if (want === "blue_water") return ["blue_water", "cyan", "teal", "blue", "white_blue"].includes(flash) || motif === "water";
  if (want === "fire_rain") return ["fire_rain", "red_fire", "orange", "dragon", "crimson", "fire_green"].includes(flash) || motif === "fire";
  if (want === "green_poison") return ["green_poison", "poison", "snake", "fire_green"].includes(flash) || motif === "snake" || motif === "poison";
  if (want === "whirlwind") return flash === "whirlwind" || flash === "wind" || motif === "whirlwind";
  if (want === "dragon") return flash === "dragon" || motif === "dragon";
  if (want === "purple") return flash === "purple" || motif === "shadow" || motif === "arcane";
  if (want === "crimson") return flash === "crimson" || flash === "gold_red" || flash === "dark_red";
  return flash === want || motif === want;
}
function auditFaction(faction, minGens) {
  const list = glist.filter((g) => (g.faction || "").toLowerCase() === faction);
  let checked = 0;
  const bad = [];
  for (const g of list) {
    const sq = g.skillsByQuality || {};
    for (const q of Q) {
      const sid = sq[q];
      if (!sid) continue;
      const sk = skillMap[sid];
      if (!sk) continue;
      const want = expectNamedFx(sk.name);
      if (!want) continue;
      checked++;
      if (!namedFxOk(sk.fx, want)) {
        bad.push(`${g.name}/${q}:${sk.name} have ${sk.fx?.flash}/${sk.fx?.motif} want ${want}`);
      }
    }
  }
  const label = faction === "wei" ? "Ngụy" : faction === "shu" ? "Thục" : faction === "wu" ? "Ngô" : faction;
  ok(list.length >= minGens, `${label} generals >= ${minGens} (got ${list.length})`);
  ok(bad.length === 0, `${label} phẩm×chiêu FX khớp tên (${checked} checked, bad: ${bad.slice(0, 5).join(" | ") || "∅"})`);
  return { checked, bad: bad.length, gens: list.length };
}
const weiR = auditFaction("wei", 40);
const shuR = auditFaction("shu", 40);
const wuR = auditFaction("wu", 38);

console.log("\n— result —", {
  passed,
  failed,
  flashKinds: flashes.size,
  assets: assets.length,
  wei: weiR,
  shu: shuR,
  wu: wuR,
});
process.exit(failed ? 1 : 0);
