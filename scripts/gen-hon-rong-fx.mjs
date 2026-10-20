#!/usr/bin/env node
/**
 * Gen soft volumetric "Hồn Rồng" VFX sheets — style gần pack Unity soft smoke/energy
 * (không pixel, LinearFilter). Pure Node PNG.
 *
 * Usage: node scripts/gen-hon-rong-fx.mjs
 * Out:   assets/fx/hon_rong/
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets/fx/hon_rong");
const SIZE = 256;

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
      // soft volumetric falloff
      let a = peak * Math.pow(1 - d, 1.6);
      if (d < 0.25) a *= 1.15;
      if (a < 0.004) continue;
      blend(buf, w, x, y, r, g, b, a);
    }
  }
}

function write(name, rgba) {
  writeFileSync(join(OUT, name), encodePng(rgba, SIZE, SIZE));
  console.log("wrote", name);
}

function genMist(phase, goldBias) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
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
    if (goldBias) {
      stampSoft(buf, SIZE, x, y, rx, ry, 255, 210 - t * 40, 120, 0.28 - t * 0.12, 0.55);
      stampSoft(buf, SIZE, x, y, rx * 0.55, ry * 0.55, 255, 245, 200, 0.35 - t * 0.15, 0.4);
    } else {
      stampSoft(buf, SIZE, x, y, rx, ry, 120, 200, 255, 0.3 - t * 0.12, 0.55);
      stampSoft(buf, SIZE, x, y, rx * 0.5, ry * 0.5, 220, 245, 255, 0.4 - t * 0.15, 0.35);
    }
  }
  return buf;
}

/**
 * Hồn long Đông Á — thân liền + đầu (mũi PHẢI) đọc được sừng/mõm/râu.
 * Soft glow nhưng silhouette rõ hơn blob thuần.
 */
function genSerpent(phase, gold) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  const spine = [];
  const pts = 72;
  for (let i = 0; i < pts; i++) {
    const t = i / (pts - 1);
    const x = SIZE * (0.1 + t * 0.72);
    const y =
      SIZE * 0.52 +
      Math.sin(t * Math.PI * 1.35 + phase) * SIZE * 0.13 +
      Math.sin(t * Math.PI * 2.6 + phase * 0.7) * SIZE * 0.035;
    let r = SIZE * 0.07;
    if (t > 0.82) r = SIZE * (0.09 + (t - 0.82) * 0.2); // cổ phình vào đầu
    else if (t < 0.2) r = SIZE * (0.035 + t * 0.15);
    else r = SIZE * (0.075 - Math.abs(t - 0.5) * 0.02);
    spine.push({ x, y, r, t });
  }

  // Thân — stamp dày overlap
  for (const p of spine) {
    if (gold) {
      stampSoft(buf, SIZE, p.x, p.y, p.r * 1.7, p.r * 1.35, 60, 160, 255, 0.22, 0.35);
      stampSoft(buf, SIZE, p.x, p.y, p.r * 1.2, p.r * 0.95, 255, 175, 55, 0.7, 0.22);
      stampSoft(buf, SIZE, p.x, p.y, p.r * 0.55, p.r * 0.45, 255, 245, 210, 0.88, 0.1);
    } else {
      stampSoft(buf, SIZE, p.x, p.y, p.r * 1.6, p.r * 1.25, 40, 140, 255, 0.35, 0.35);
      stampSoft(buf, SIZE, p.x, p.y, p.r * 0.9, p.r * 0.7, 160, 220, 255, 0.65, 0.18);
      stampSoft(buf, SIZE, p.x, p.y, p.r * 0.4, p.r * 0.32, 255, 255, 255, 0.85, 0.08);
    }
  }

  // Gai lưng
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
      gold ? 255 : 180,
      gold ? 220 : 230,
      gold ? 120 : 255,
      0.55,
      0.2
    );
  }

  // Đầu — profile rõ, há miệng hướng phải
  const tip = spine[spine.length - 1];
  const hx = tip.x + SIZE * 0.04;
  const hy = tip.y;
  if (gold) {
    stampSoft(buf, SIZE, hx, hy, SIZE * 0.14, SIZE * 0.11, 80, 180, 255, 0.45, 0.3);
    stampSoft(buf, SIZE, hx, hy, SIZE * 0.11, SIZE * 0.09, 255, 210, 100, 0.95, 0.15);
    // mõm
    stampSoft(buf, SIZE, hx + SIZE * 0.09, hy - SIZE * 0.01, SIZE * 0.09, SIZE * 0.05, 255, 240, 180, 0.95, 0.08);
    stampSoft(buf, SIZE, hx + SIZE * 0.08, hy + SIZE * 0.035, SIZE * 0.07, SIZE * 0.035, 255, 160, 60, 0.7, 0.12);
    // sừng
    stampSoft(buf, SIZE, hx - SIZE * 0.02, hy - SIZE * 0.12, SIZE * 0.03, SIZE * 0.09, 255, 235, 150, 0.85, 0.12);
    stampSoft(buf, SIZE, hx + SIZE * 0.03, hy - SIZE * 0.13, SIZE * 0.028, SIZE * 0.085, 255, 235, 150, 0.8, 0.12);
    stampSoft(buf, SIZE, hx - SIZE * 0.05, hy - SIZE * 0.16, SIZE * 0.02, SIZE * 0.04, 255, 220, 120, 0.6, 0.15);
    // râu
    stampSoft(buf, SIZE, hx + SIZE * 0.06, hy + SIZE * 0.06, SIZE * 0.08, SIZE * 0.025, 255, 230, 160, 0.55, 0.2);
    stampSoft(buf, SIZE, hx + SIZE * 0.05, hy - SIZE * 0.05, SIZE * 0.075, SIZE * 0.022, 200, 230, 255, 0.45, 0.2);
    // mắt
    stampSoft(buf, SIZE, hx + SIZE * 0.03, hy - SIZE * 0.02, SIZE * 0.028, SIZE * 0.024, 255, 255, 255, 1, 0.05);
    stampSoft(buf, SIZE, hx + SIZE * 0.035, hy - SIZE * 0.02, SIZE * 0.012, SIZE * 0.012, 40, 20, 0, 0.9, 0.02);
    // bờm sau đầu
    stampSoft(buf, SIZE, hx - SIZE * 0.1, hy, SIZE * 0.1, SIZE * 0.08, 255, 140, 40, 0.4, 0.35);
  } else {
    stampSoft(buf, SIZE, hx, hy, SIZE * 0.13, SIZE * 0.1, 160, 220, 255, 0.9, 0.18);
    stampSoft(buf, SIZE, hx + SIZE * 0.08, hy, SIZE * 0.08, SIZE * 0.045, 255, 255, 255, 0.95, 0.08);
  }
  return buf;
}

function genSparkle(phase) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let i = 0; i < 28; i++) {
    const a = phase + i * 2.4;
    const r = SIZE * (0.08 + (i % 7) * 0.05);
    const x = SIZE * 0.5 + Math.cos(a) * r;
    const y = SIZE * 0.5 + Math.sin(a * 1.1) * r * 0.85;
    const s = SIZE * (0.02 + (i % 3) * 0.012);
    const gold = i % 3 !== 0;
    if (gold) stampSoft(buf, SIZE, x, y, s, s, 255, 230, 160, 0.9, 0.1);
    else stampSoft(buf, SIZE, x, y, s * 1.2, s * 1.2, 160, 220, 255, 0.75, 0.15);
  }
  stampSoft(buf, SIZE, SIZE * 0.5, SIZE * 0.5, SIZE * 0.08, SIZE * 0.08, 255, 255, 255, 0.5, 0.2);
  return buf;
}

function genOrb(r, g, b) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  const c = SIZE * 0.5;
  stampSoft(buf, SIZE, c, c, SIZE * 0.42, SIZE * 0.42, r * 0.5, g * 0.5, b * 0.5, 0.35, 0.5);
  stampSoft(buf, SIZE, c, c, SIZE * 0.28, SIZE * 0.28, r, g, b, 0.7, 0.35);
  stampSoft(buf, SIZE, c, c, SIZE * 0.12, SIZE * 0.12, 255, 255, 255, 0.95, 0.1);
  stampSoft(buf, SIZE, c - SIZE * 0.06, c - SIZE * 0.08, SIZE * 0.06, SIZE * 0.05, 255, 255, 255, 0.55, 0.05);
  return buf;
}

function genRing(phase) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  const c = SIZE * 0.5;
  for (let i = 0; i < 64; i++) {
    const t = i / 64;
    const ang = t * Math.PI * 2 + phase;
    const rad = SIZE * (0.28 + 0.04 * Math.sin(t * 8 + phase));
    const x = c + Math.cos(ang) * rad;
    const y = c + Math.sin(ang) * rad * 0.55; // perspective squash
    const gold = i % 2 === 0;
    if (gold) stampSoft(buf, SIZE, x, y, SIZE * 0.06, SIZE * 0.04, 255, 200, 80, 0.45, 0.3);
    else stampSoft(buf, SIZE, x, y, SIZE * 0.07, SIZE * 0.045, 100, 190, 255, 0.4, 0.35);
  }
  return buf;
}

function genCrescent(phase) {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let i = 0; i < 36; i++) {
    const t = i / 35;
    const ang = -0.9 + t * 2.2 + phase * 0.05;
    const rad = SIZE * 0.32;
    const x = SIZE * 0.48 + Math.cos(ang) * rad;
    const y = SIZE * 0.55 + Math.sin(ang) * rad * 0.7;
    stampSoft(buf, SIZE, x, y, SIZE * 0.08, SIZE * 0.05, 255, 170, 50, 0.5, 0.25);
    stampSoft(buf, SIZE, x, y, SIZE * 0.04, SIZE * 0.025, 255, 245, 200, 0.7, 0.1);
  }
  return buf;
}

mkdirSync(OUT, { recursive: true });

for (let i = 0; i < 8; i++) {
  const p = (i / 8) * Math.PI * 2;
  write(`serpent_gold_${String(i + 1).padStart(2, "0")}.png`, genSerpent(p, true));
}
for (let i = 0; i < 6; i++) {
  const p = (i / 6) * Math.PI * 2;
  write(`serpent_blue_${String(i + 1).padStart(2, "0")}.png`, genSerpent(p, false));
}
for (let i = 0; i < 4; i++) {
  write(`mist_gold_${String(i + 1).padStart(2, "0")}.png`, genMist((i / 4) * 6.28, true));
  write(`mist_blue_${String(i + 1).padStart(2, "0")}.png`, genMist((i / 4) * 6.28 + 1.2, false));
}
for (let i = 0; i < 4; i++) {
  write(`sparkle_${String(i + 1).padStart(2, "0")}.png`, genSparkle((i / 4) * 6.28));
}
write("orb_gold.png", genOrb(255, 210, 90));
write("orb_blue.png", genOrb(100, 190, 255));
write("orb_white.png", genOrb(240, 245, 255));
for (let i = 0; i < 4; i++) {
  write(`ring_${String(i + 1).padStart(2, "0")}.png`, genRing((i / 4) * 1.5));
}
for (let i = 0; i < 3; i++) {
  write(`crescent_${String(i + 1).padStart(2, "0")}.png`, genCrescent(i * 0.15));
}

writeFileSync(
  join(OUT, "README.md"),
  `# Hồn Rồng soft VFX\n\nGenerated by \`scripts/gen-hon-rong-fx.mjs\`.\nStyle: soft volumetric energy (serpentine / mist / orb / ring) — Kim + Lam.\n`
);
console.log("Done →", OUT);
