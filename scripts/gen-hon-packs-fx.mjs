#!/usr/bin/env node
/**
 * Gen soft volumetric "Hồn" VFX packs — cùng style Hồn Rồng, đổi palette + silhouette.
 *
 * Packs:
 *   hon_rong  — Hỏa Long (cam lửa)
 *   hon_xa    — Độc Xà (lục)
 *   hon_ho    — Hổ Khiếu (vàng hổ)
 *   hon_soi   — Lang Tuyền (đỏ thẫm)
 *   hon_thuy  — Thủy Chiến (lam)
 *   hon_loi   — Lôi (xanh trời)
 *   hon_phong — Phong / lốc (ngọc)
 *
 * Usage: node scripts/gen-hon-packs-fx.mjs
 * Out:   assets/fx/hon_<id>/
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SIZE = 256;

/** @typedef {{ id: string, title: string, body: number[], glow: number[], core: number[], mist: number[], spark: number[], thin?: number, head?: 'dragon'|'snake'|'beast'|'swirl' }} PackDef */

/** @type {PackDef[]} */
const PACKS = [
  {
    id: "hon_rong",
    title: "Hồn Rồng — Hỏa",
    body: [255, 122, 46],
    glow: [220, 40, 20],
    core: [255, 224, 138],
    mist: [255, 107, 46],
    spark: [255, 193, 77],
    head: "dragon",
  },
  {
    id: "hon_xa",
    title: "Hồn Xà — Độc",
    body: [74, 222, 128],
    glow: [22, 101, 52],
    core: [220, 252, 231],
    mist: [52, 211, 153],
    spark: [190, 242, 100],
    thin: 0.72,
    head: "snake",
  },
  {
    id: "hon_ho",
    title: "Hồn Hổ",
    body: [251, 191, 36],
    glow: [180, 83, 9],
    core: [255, 247, 237],
    mist: [245, 158, 11],
    spark: [254, 243, 199],
    head: "beast",
  },
  {
    id: "hon_soi",
    title: "Hồn Sói",
    body: [252, 165, 165],
    glow: [127, 29, 29],
    core: [255, 228, 230],
    mist: [248, 113, 113],
    spark: [254, 202, 202],
    head: "beast",
  },
  {
    id: "hon_thuy",
    title: "Hồn Thủy",
    body: [56, 189, 248],
    glow: [29, 78, 216],
    core: [224, 242, 254],
    mist: [125, 211, 252],
    spark: [186, 230, 253],
    head: "dragon",
  },
  {
    id: "hon_loi",
    title: "Hồn Lôi",
    body: [125, 211, 252],
    glow: [3, 105, 161],
    core: [240, 249, 255],
    mist: [56, 189, 248],
    spark: [255, 255, 255],
    thin: 0.85,
    head: "swirl",
  },
  {
    id: "hon_phong",
    title: "Hồn Phong",
    body: [167, 243, 208],
    glow: [15, 118, 110],
    core: [236, 253, 245],
    mist: [94, 234, 212],
    spark: [204, 251, 241],
    head: "swirl",
  },
];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(rgba, w, h) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    const row = y * (w * 4 + 1);
    raw[row] = 0;
    rgba.copy(raw, row + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise2(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash2(x0, y0);
  const b = hash2(x0 + 1, y0);
  const c = hash2(x0, y0 + 1);
  const d = hash2(x0 + 1, y0 + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x, y, oct = 4) {
  let amp = 0.5;
  let f = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    sum += amp * noise2(x * f, y * f);
    norm += amp;
    amp *= 0.5;
    f *= 2.1;
  }
  return sum / norm;
}

function blend(buf, w, x, y, r, g, b, a) {
  const xi = x | 0;
  const yi = y | 0;
  if (xi < 0 || yi < 0 || xi >= w || yi >= w) return;
  const i = (yi * w + xi) * 4;
  const oa = buf[i + 3] / 255;
  const na = Math.max(0, Math.min(1, a));
  const outA = na + oa * (1 - na);
  if (outA <= 0.001) return;
  buf[i] = Math.min(255, (r * na + buf[i] * oa * (1 - na)) / outA);
  buf[i + 1] = Math.min(255, (g * na + buf[i + 1] * oa * (1 - na)) / outA);
  buf[i + 2] = Math.min(255, (b * na + buf[i + 2] * oa * (1 - na)) / outA);
  buf[i + 3] = Math.min(255, outA * 255);
}

function stampSoft(buf, w, cx, cy, rx, ry, r, g, b, peak, noiseAmt = 0.35) {
  const x0 = Math.max(0, Math.floor(cx - rx));
  const x1 = Math.min(w - 1, Math.ceil(cx + rx));
  const y0 = Math.max(0, Math.floor(cy - ry));
  const y1 = Math.min(w - 1, Math.ceil(cy + ry));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      let d = Math.sqrt(nx * nx + ny * ny);
      if (d > 1.05) continue;
      const n = fbm(x * 0.045 + cx * 0.01, y * 0.045 + cy * 0.01);
      d = d + (n - 0.5) * noiseAmt;
      if (d > 1) continue;
      let a = peak * Math.pow(1 - d, 1.6);
      if (d < 0.25) a *= 1.15;
      if (a < 0.004) continue;
      blend(buf, w, x, y, r, g, b, a);
    }
  }
}

function write(dir, name, rgba) {
  writeFileSync(join(dir, name), encodePng(rgba, SIZE, SIZE));
}

/** @param {PackDef} pack */
function genMist(pack, phase) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  const [br, bg, bb] = pack.mist;
  const [cr, cg, cb] = pack.core;
  const cx = SIZE * 0.5;
  const cy = SIZE * 0.52;
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const ang = phase + t * 6.2;
    const rad = SIZE * (0.08 + t * 0.22);
    const x = cx + Math.cos(ang) * rad * 0.55 + (t - 0.5) * SIZE * 0.08;
    const y = cy + Math.sin(ang * 0.7) * rad * 0.4;
    const rx = SIZE * (0.18 + t * 0.12);
    const ry = SIZE * (0.14 + t * 0.1);
    stampSoft(buf, SIZE, x, y, rx, ry, br, bg, bb, 0.3 - t * 0.12, 0.55);
    stampSoft(buf, SIZE, x, y, rx * 0.5, ry * 0.5, cr, cg, cb, 0.4 - t * 0.15, 0.35);
  }
  return buf;
}

/** @param {PackDef} pack */
function genSerpent(pack, phase) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  const thin = pack.thin ?? 1;
  const [br, bg, bb] = pack.body;
  const [gr, gg, gb] = pack.glow;
  const [cr, cg, cb] = pack.core;
  const spine = [];
  const pts = 72;
  const wave = pack.head === "swirl" ? 2.1 : 1.35;
  for (let i = 0; i < pts; i++) {
    const t = i / (pts - 1);
    const x = SIZE * (0.1 + t * 0.72);
    const y =
      SIZE * 0.52 +
      Math.sin(t * Math.PI * wave + phase) * SIZE * (0.11 + (pack.head === "swirl" ? 0.06 : 0)) +
      Math.sin(t * Math.PI * 2.6 + phase * 0.7) * SIZE * 0.035;
    let r = SIZE * 0.07 * thin;
    if (t > 0.82) r = SIZE * (0.09 + (t - 0.82) * 0.2) * thin;
    else if (t < 0.2) r = SIZE * (0.035 + t * 0.15) * thin;
    else r = SIZE * (0.075 - Math.abs(t - 0.5) * 0.02) * thin;
    spine.push({ x, y, r, t });
  }

  for (const p of spine) {
    stampSoft(buf, SIZE, p.x, p.y, p.r * 1.7, p.r * 1.35, gr, gg, gb, 0.28, 0.35);
    stampSoft(buf, SIZE, p.x, p.y, p.r * 1.2, p.r * 0.95, br, bg, bb, 0.72, 0.22);
    stampSoft(buf, SIZE, p.x, p.y, p.r * 0.55, p.r * 0.45, cr, cg, cb, 0.88, 0.1);
  }

  for (let i = 8; i < spine.length - 8; i += 3) {
    const p = spine[i];
    const n = spine[i + 1] || p;
    const dx = n.x - p.x;
    const dy = n.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len;
    const py = dx / len;
    stampSoft(
      buf,
      SIZE,
      p.x + px * p.r * 1.6,
      p.y + py * p.r * 1.6,
      SIZE * 0.035,
      SIZE * 0.055,
      cr,
      cg,
      cb,
      0.55,
      0.2
    );
  }

  const tip = spine[spine.length - 1];
  const hx = tip.x + SIZE * 0.04;
  const hy = tip.y;
  const head = pack.head || "dragon";

  stampSoft(buf, SIZE, hx, hy, SIZE * 0.14, SIZE * 0.11, gr, gg, gb, 0.45, 0.3);
  stampSoft(buf, SIZE, hx, hy, SIZE * 0.11, SIZE * 0.09, br, bg, bb, 0.95, 0.15);

  if (head === "snake") {
    // Đầu xà nhọn + lưỡi
    stampSoft(buf, SIZE, hx + SIZE * 0.1, hy, SIZE * 0.1, SIZE * 0.04, br, bg, bb, 0.95, 0.08);
    stampSoft(buf, SIZE, hx + SIZE * 0.14, hy - SIZE * 0.02, SIZE * 0.05, SIZE * 0.015, cr, cg, cb, 0.8, 0.1);
    stampSoft(buf, SIZE, hx + SIZE * 0.14, hy + SIZE * 0.02, SIZE * 0.05, SIZE * 0.015, cr, cg, cb, 0.8, 0.1);
    stampSoft(buf, SIZE, hx + SIZE * 0.02, hy - SIZE * 0.02, SIZE * 0.022, SIZE * 0.02, 255, 255, 255, 1, 0.05);
    stampSoft(buf, SIZE, hx + SIZE * 0.025, hy - SIZE * 0.02, SIZE * 0.01, SIZE * 0.01, 20, 40, 10, 0.9, 0.02);
  } else if (head === "beast") {
    // Mõm thú + tai
    stampSoft(buf, SIZE, hx + SIZE * 0.08, hy, SIZE * 0.09, SIZE * 0.06, br, bg, bb, 0.95, 0.1);
    stampSoft(buf, SIZE, hx - SIZE * 0.02, hy - SIZE * 0.12, SIZE * 0.04, SIZE * 0.07, br, bg, bb, 0.85, 0.12);
    stampSoft(buf, SIZE, hx + SIZE * 0.04, hy - SIZE * 0.13, SIZE * 0.038, SIZE * 0.065, br, bg, bb, 0.8, 0.12);
    stampSoft(buf, SIZE, hx + SIZE * 0.02, hy - SIZE * 0.02, SIZE * 0.03, SIZE * 0.025, 255, 255, 255, 1, 0.05);
    stampSoft(buf, SIZE, hx + SIZE * 0.028, hy - SIZE * 0.02, SIZE * 0.012, SIZE * 0.012, 40, 10, 0, 0.9, 0.02);
    stampSoft(buf, SIZE, hx - SIZE * 0.08, hy + SIZE * 0.02, SIZE * 0.09, SIZE * 0.06, gr, gg, gb, 0.4, 0.3);
  } else if (head === "swirl") {
    // Đầu năng lượng xoáy
    stampSoft(buf, SIZE, hx + SIZE * 0.06, hy, SIZE * 0.1, SIZE * 0.1, cr, cg, cb, 0.9, 0.2);
    for (let k = 0; k < 5; k++) {
      const a = phase + k * 1.2;
      stampSoft(
        buf,
        SIZE,
        hx + Math.cos(a) * SIZE * 0.08,
        hy + Math.sin(a) * SIZE * 0.06,
        SIZE * 0.04,
        SIZE * 0.03,
        br,
        bg,
        bb,
        0.65,
        0.2
      );
    }
  } else {
    // Dragon — sừng / mõm / râu
    stampSoft(buf, SIZE, hx + SIZE * 0.09, hy - SIZE * 0.01, SIZE * 0.09, SIZE * 0.05, cr, cg, cb, 0.95, 0.08);
    stampSoft(buf, SIZE, hx + SIZE * 0.08, hy + SIZE * 0.035, SIZE * 0.07, SIZE * 0.035, br, bg - 40, bb - 40, 0.7, 0.12);
    stampSoft(buf, SIZE, hx - SIZE * 0.02, hy - SIZE * 0.12, SIZE * 0.03, SIZE * 0.09, cr, cg, cb, 0.85, 0.12);
    stampSoft(buf, SIZE, hx + SIZE * 0.03, hy - SIZE * 0.13, SIZE * 0.028, SIZE * 0.085, cr, cg, cb, 0.8, 0.12);
    stampSoft(buf, SIZE, hx + SIZE * 0.06, hy + SIZE * 0.06, SIZE * 0.08, SIZE * 0.025, cr, cg, cb, 0.55, 0.2);
    stampSoft(buf, SIZE, hx + SIZE * 0.03, hy - SIZE * 0.02, SIZE * 0.028, SIZE * 0.024, 255, 255, 255, 1, 0.05);
    stampSoft(buf, SIZE, hx + SIZE * 0.035, hy - SIZE * 0.02, SIZE * 0.012, SIZE * 0.012, 40, 20, 0, 0.9, 0.02);
    stampSoft(buf, SIZE, hx - SIZE * 0.1, hy, SIZE * 0.1, SIZE * 0.08, gr, gg, gb, 0.4, 0.35);
  }
  return buf;
}

/** @param {PackDef} pack */
function genSparkle(pack, phase) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  const [sr, sg, sb] = pack.spark;
  const [br, bg, bb] = pack.body;
  for (let i = 0; i < 28; i++) {
    const a = phase + i * 2.4;
    const r = SIZE * (0.08 + (i % 7) * 0.05);
    const x = SIZE * 0.5 + Math.cos(a) * r;
    const y = SIZE * 0.5 + Math.sin(a * 1.1) * r * 0.85;
    const s = SIZE * (0.02 + (i % 3) * 0.012);
    if (i % 3 !== 0) stampSoft(buf, SIZE, x, y, s, s, sr, sg, sb, 0.9, 0.1);
    else stampSoft(buf, SIZE, x, y, s * 1.2, s * 1.2, br, bg, bb, 0.75, 0.15);
  }
  stampSoft(buf, SIZE, SIZE * 0.5, SIZE * 0.5, SIZE * 0.08, SIZE * 0.08, 255, 255, 255, 0.45, 0.2);
  return buf;
}

/** @param {PackDef} pack */
function genOrb(pack) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  const [br, bg, bb] = pack.body;
  const c = SIZE * 0.5;
  stampSoft(buf, SIZE, c, c, SIZE * 0.42, SIZE * 0.42, br * 0.5, bg * 0.5, bb * 0.5, 0.35, 0.5);
  stampSoft(buf, SIZE, c, c, SIZE * 0.28, SIZE * 0.28, br, bg, bb, 0.7, 0.35);
  stampSoft(buf, SIZE, c, c, SIZE * 0.12, SIZE * 0.12, 255, 255, 255, 0.95, 0.1);
  stampSoft(buf, SIZE, c - SIZE * 0.06, c - SIZE * 0.08, SIZE * 0.06, SIZE * 0.05, 255, 255, 255, 0.55, 0.05);
  return buf;
}

/** @param {PackDef} pack */
function genRing(pack, phase) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  const [br, bg, bb] = pack.body;
  const [cr, cg, cb] = pack.core;
  const c = SIZE * 0.5;
  for (let i = 0; i < 64; i++) {
    const t = i / 64;
    const ang = t * Math.PI * 2 + phase;
    const rad = SIZE * (0.28 + 0.04 * Math.sin(t * 8 + phase));
    const x = c + Math.cos(ang) * rad;
    const y = c + Math.sin(ang) * rad * 0.55;
    if (i % 2 === 0) stampSoft(buf, SIZE, x, y, SIZE * 0.06, SIZE * 0.04, br, bg, bb, 0.45, 0.3);
    else stampSoft(buf, SIZE, x, y, SIZE * 0.07, SIZE * 0.045, cr, cg, cb, 0.4, 0.35);
  }
  return buf;
}

/** @param {PackDef} pack */
function genCrescent(pack, phase) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  const [br, bg, bb] = pack.body;
  const [cr, cg, cb] = pack.core;
  for (let i = 0; i < 36; i++) {
    const t = i / 35;
    const ang = -0.9 + t * 2.2 + phase * 0.05;
    const rad = SIZE * 0.32;
    const x = SIZE * 0.48 + Math.cos(ang) * rad;
    const y = SIZE * 0.55 + Math.sin(ang) * rad * 0.7;
    stampSoft(buf, SIZE, x, y, SIZE * 0.08, SIZE * 0.05, br, bg, bb, 0.5, 0.25);
    stampSoft(buf, SIZE, x, y, SIZE * 0.04, SIZE * 0.025, cr, cg, cb, 0.7, 0.1);
  }
  return buf;
}

/** @param {PackDef} pack */
function genPack(pack) {
  const out = join(ROOT, "assets/fx", pack.id);
  mkdirSync(out, { recursive: true });
  console.log("→", pack.id, pack.title);

  for (let i = 0; i < 8; i++) {
    const p = (i / 8) * Math.PI * 2;
    write(out, `serpent_${String(i + 1).padStart(2, "0")}.png`, genSerpent(pack, p));
  }
  for (let i = 0; i < 4; i++) {
    write(out, `mist_${String(i + 1).padStart(2, "0")}.png`, genMist(pack, (i / 4) * 6.28));
  }
  for (let i = 0; i < 4; i++) {
    write(out, `sparkle_${String(i + 1).padStart(2, "0")}.png`, genSparkle(pack, (i / 4) * 6.28));
  }
  write(out, "orb.png", genOrb(pack));
  for (let i = 0; i < 4; i++) {
    write(out, `ring_${String(i + 1).padStart(2, "0")}.png`, genRing(pack, (i / 4) * 1.5));
  }
  for (let i = 0; i < 3; i++) {
    write(out, `crescent_${String(i + 1).padStart(2, "0")}.png`, genCrescent(pack, i * 0.15));
  }

  writeFileSync(
    join(out, "README.md"),
    `# ${pack.title}\n\nGenerated by \`scripts/gen-hon-packs-fx.mjs\`.\nSoft volumetric spirit — serpent / mist / orb / ring / crescent.\nTint RGB body \`[${pack.body.join(", ")}]\`.\n`
  );
}

for (const pack of PACKS) genPack(pack);

// Mirror fire pack into legacy hon_rong gold/blue names for old paths (compat)
const legacy = join(ROOT, "assets/fx/hon_rong");
mkdirSync(legacy, { recursive: true });
console.log("→ hon_rong (compat aliases from fire pack)");
{
  const fire = PACKS.find((p) => p.id === "hon_rong");
  for (let i = 0; i < 8; i++) {
    const p = (i / 8) * Math.PI * 2;
    write(legacy, `serpent_gold_${String(i + 1).padStart(2, "0")}.png`, genSerpent(fire, p));
  }
  for (let i = 0; i < 6; i++) {
    const p = (i / 6) * Math.PI * 2;
    // "blue" layer = darker ember underlayer
    const under = { ...fire, body: fire.glow, glow: [120, 20, 10], core: fire.body };
    write(legacy, `serpent_blue_${String(i + 1).padStart(2, "0")}.png`, genSerpent(under, p));
  }
  for (let i = 0; i < 4; i++) {
    write(legacy, `mist_gold_${String(i + 1).padStart(2, "0")}.png`, genMist(fire, (i / 4) * 6.28));
    write(legacy, `mist_blue_${String(i + 1).padStart(2, "0")}.png`, genMist(fire, (i / 4) * 6.28 + 1.2));
    write(legacy, `sparkle_${String(i + 1).padStart(2, "0")}.png`, genSparkle(fire, (i / 4) * 6.28));
    write(legacy, `ring_${String(i + 1).padStart(2, "0")}.png`, genRing(fire, (i / 4) * 1.5));
  }
  write(legacy, "orb_gold.png", genOrb(fire));
  write(legacy, "orb_blue.png", genOrb({ ...fire, body: fire.glow }));
  write(legacy, "orb_white.png", genOrb({ ...fire, body: fire.core }));
  for (let i = 0; i < 3; i++) {
    write(legacy, `crescent_${String(i + 1).padStart(2, "0")}.png`, genCrescent(fire, i * 0.15));
  }
}

writeFileSync(
  join(ROOT, "assets/fx/HON_PACKS.md"),
  `# Hồn spirit packs

Generated: \`npm run gen:hon-packs\` → \`scripts/gen-hon-packs-fx.mjs\`

| Folder | Motif / style | Màu |
|--------|---------------|-----|
| \`hon_rong/\` | dragon / breath (Hỏa Long) | Cam lửa |
| \`hon_xa/\` | snake / poison | Lục |
| \`hon_ho/\` | tiger / roar | Vàng hổ |
| \`hon_soi/\` | wolf | Đỏ thẫm |
| \`hon_thuy/\` | water / tide | Lam |
| \`hon_loi/\` | thunder | Xanh trời |
| \`hon_phong/\` | whirlwind | Ngọc |

Mỗi pack: \`serpent_01–08\`, \`mist_01–04\`, \`sparkle_01–04\`, \`orb.png\`, \`ring_01–04\`, \`crescent_01–03\`.

Procedural soft volumetric (không phụ thuộc asset ngoài). Có thể thay PNG tay / CC0 sau — giữ tên file.
`
);

console.log("Done —", PACKS.length, "packs + hon_rong compat");
