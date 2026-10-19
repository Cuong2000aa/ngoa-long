#!/usr/bin/env node
/**
 * Audit MỌI chiêu: keyword tên/mô tả không được lệch motif/flash.
 * node scripts/audit-all-skills.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skills = JSON.parse(fs.readFileSync(path.join(ROOT, "data/skills.json"), "utf8")).skills;

let failed = 0;
let passed = 0;
function ok(cond, msg) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error("FAIL —", msg);
  }
}

/** Rule bắt buộc — FIRST match thắng (compound trước generic) */
const MUST = [
  [/Hỏa Long Tiễn|Long Tiễn/i, (fx) => fx.motif === "dragon"],
  [/Phong Tiễn/i, (fx) => fx.motif === "whirlwind"],
  [/Lôi Tiễn|Lôi Kích|Thần Lôi|Kinh Lôi/i, (fx) => fx.motif === "thunder" || fx.flash === "thunder"],
  [/Hỏa Tiễn|Viêm .{0,4}Tiễn/i, (fx) => fx.motif === "fire" || fx.flash === "fire_rain"],
  [/Triệu Hổ|Hổ Khiếu|Hổ Bôn|Hổ Xung|Hổ Sát|Mãnh Hổ/i, (fx) => fx.motif === "tiger"],
  [/Giáp|Thiết Bích|Hộ Thể|Thủ Hộ|Hãn Vệ|Lấy Thân Làm Giáp/i, (fx) => fx.motif === "shield" || fx.flash === "shield"],
  [/Đột Kích|Tập Kích|Đột Tiến|Đột Tập|Cường Tập|Nộ Tập|Tật Xung|Nghịch Tập/i, (fx) => fx.motif === "rush"],
  [/Kỵ Liệp|Kỵ Kích|Chiến Kỵ|Thiết Kỵ|Đơn Kỵ|Nhất Kỵ/i, (fx) => fx.motif === "charge"],
  [/Lang Tuyền|Sói/i, (fx) => fx.motif === "wolf"],
  [/Thanh Long|Hỏa Long|Thương Long|Phục Long/i, (fx) => fx.motif === "dragon"],
  [/Thiên Hỏa|Hỏa Thần|Xích Lửa|Lửa Lục/i, (fx) => fx.motif === "fire" || fx.flash === "fire_green" || fx.flash === "fire_rain"],
  [/Độc Xà|Độc Địa|Độc /i, (fx) => fx.motif === "poison" || fx.motif === "snake"],
  [/Bát Quái|Bát Trận|Kỳ Môn|Phá Trận|Ngũ Hành/i, (fx) => fx.motif === "bagua" || fx.motif === "tiger"],
  [/Lạc Thủy|Thủy Chiến|Vũ Thánh|Thiên Vũ|Phượng Vũ/i, (fx) => fx.motif === "water" || fx.flash === "blue_water"],
  [/Dòng Xoáy|Cuồng Phong|Phong Hầu|Uy Phong|Tang Phong/i, (fx) => fx.motif === "whirlwind"],
  [/Tiễn|Nghệ Xạ|Xạ Sát|Liên Nỏ|Kỵ Xạ|Xạ Thủ|Kình Nỏ|Giương Cung|Tề Xạ|Phi Xạ/i, (fx) => fx.flash === "yellow" || fx.motif === "pierce" || fx.motif === "thunder" || fx.motif === "fire" || fx.motif === "dragon" || fx.motif === "whirlwind"],
  [/Kỳ Mưu|Ẩn Mưu|Quỷ Cốc|Định Kế/i, (fx) => fx.motif === "shadow" || fx.motif === "arcane"],
  [/Huyết Chiến|Huyết Quỷ|Nộ Sát|Quỷ Sát|Bác Sát/i, (fx) => fx.flash === "crimson" || fx.motif === "slash"],
];

const bad = [];
for (const [sid, sk] of Object.entries(skills)) {
  const name = sk.name || "";
  const fx = sk.fx || {};
  for (const [re, check] of MUST) {
    if (!re.test(name)) continue;
    if (!check(fx)) {
      bad.push(`${sid}:${name} → ${fx.motif}/${fx.flash} (rule ${re})`);
    }
    break; // first match only
  }
  // Mọi skill phải có motif+flash+style
  if (!fx.motif || !fx.flash) bad.push(`${sid}:${name} thiếu motif/flash`);
  if (!fx.style) bad.push(`${sid}:${name} thiếu fx.style`);
  // Pattern cột: cho phép barrier/aura nếu chiêu hỗ trợ
  if (sk.pattern === "column") {
    const st = fx.style || "";
    const okSt =
      st === "column_pierce" ||
      st.startsWith("beast_") ||
      st.startsWith("element_") ||
      st === "rush_assault" ||
      st === "cavalry_charge" ||
      st === "barrier" ||
      st === "ally_aura" ||
      st === "single_strike";
    if (!okSt) bad.push(`${sid}:${name} column nhưng style=${st}`);
  }
}

ok(bad.length === 0, `keyword audit 0 bad (got ${bad.length})`);
if (bad.length) {
  bad.slice(0, 40).forEach((b) => console.error(" ", b));
  if (bad.length > 40) console.error(`  … +${bad.length - 40} more`);
}

// Python re-infer must match stored fx for ALL skills
const py = spawnSync(
  "python3",
  [
    "-c",
    `
import json,sys
sys.path.insert(0,'scripts')
from lib_skill_semantics import infer_motif_flash
skills=json.load(open('data/skills.json'))['skills']
bad=[]
for sid,s in skills.items():
  fx=s.get('fx') or {}
  m,f=infer_motif_flash(s.get('name') or '', s.get('desc') or '', s.get('pattern'))
  if fx.get('motif')!=m or fx.get('flash')!=f:
    bad.append(f"{sid}:{s.get('name')} have {fx.get('motif')}/{fx.get('flash')} want {m}/{f}")
print(len(bad))
for b in bad[:30]:
  print(b)
sys.exit(1 if bad else 0)
`,
  ],
  { cwd: ROOT, encoding: "utf-8" }
);
ok(py.status === 0, `re-infer khớp 100% skills (stderr/out: ${(py.stdout || "").split("\\n")[0]})`);
if (py.status !== 0) console.error(py.stdout || py.stderr);

// Motif distribution sanity
const motifs = {};
for (const s of Object.values(skills)) {
  const m = s.fx?.motif || "?";
  motifs[m] = (motifs[m] || 0) + 1;
}
ok((motifs.slash || 0) <= 170, `slash <= 170 sau audit (got ${motifs.slash})`);
ok((motifs.rush || 0) >= 10, `rush >= 10 (got ${motifs.rush})`);
ok((motifs.charge || 0) >= 8, `charge >= 8 (got ${motifs.charge})`);
ok((motifs.pierce || 0) >= 25, `pierce/arrow >= 25 (got ${motifs.pierce})`);
ok((motifs.shadow || 0) >= 15, `shadow >= 15 (got ${motifs.shadow})`);
ok(Object.keys(skills).length >= 500, `skills >= 500 (got ${Object.keys(skills).length})`);

console.log("\nmotifs", motifs);
console.log(`${passed} passed, ${failed} failed, skills=${Object.keys(skills).length}`);
process.exit(failed ? 1 : 0);
