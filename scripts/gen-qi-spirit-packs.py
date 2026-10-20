#!/usr/bin/env python3
"""
Gen qi_* spirit packs từ hon_rong/qi_fire (cùng style SRPG).
- Elemental serpent/dragon: hue/palette remap + beat variation
- Tiger/wolf: nếu có seed AI trong qi_seed/ thì expand; không thì remap tạm + note

Usage:
  python3 scripts/gen-qi-spirit-packs.py
"""
from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/fx/hon_rong/qi_fire"
OUT_ROOT = ROOT / "assets/fx"

# (rel_dir, target_hue 0-360, sat_mul, val_mul, label)
# Fire orange ~25° → shift to target
PACKS = [
    ("hon_xa/qi_poison", 130, 1.05, 0.95, "Độc xà — lục độc"),
    ("hon_thuy/qi_water", 198, 1.1, 1.0, "Thủy hồn — lam nước"),
    ("hon_loi/qi_thunder", 52, 1.25, 1.12, "Lôi long — vàng sét"),
    ("hon_phong/qi_wind", 185, 0.85, 1.08, "Phong hồn — cyan gió"),
    ("hon_rong/qi_azure", 175, 1.05, 1.0, "Thanh Long — lam lục"),
    ("hon_rong/qi_ivory", 210, 0.22, 1.18, "Bạch Long — bạc trắng"),
    ("hon_ho/qi_tiger", 38, 1.15, 1.05, "Hổ — hổ phách (AI seed + expand)"),
    ("hon_soi/qi_wolf", 220, 0.35, 1.1, "Sói — xám bạc (AI seed + expand)"),
]

CHARGE_N = 4
FLIGHT_N = 4
IMPACT_N = 3


def load_rgba(p: Path) -> Image.Image:
    return Image.open(p).convert("RGBA")


def remap_hue(im: Image.Image, target_h: float, sat_mul: float, val_mul: float) -> Image.Image:
    """Giữ alpha; map hue lửa (~15–40°) → target; giữ highlight gần trắng."""
    src = im.convert("RGBA")
    h, s, v = src.convert("HSV").split()
    a = src.split()[3]
    hx = h.load()
    sx = s.load()
    vx = v.load()
    w, hh = src.size
    # Fire hue band in PIL HSV: H is 0–255 → degrees = H/255*360
    for y in range(hh):
        for x in range(w):
            if a.getpixel((x, y)) < 8:
                continue
            h0 = hx[x, y] / 255.0 * 360.0
            s0 = sx[x, y] / 255.0
            v0 = vx[x, y] / 255.0
            # Near-white core: only slight tint
            if v0 > 0.92 and s0 < 0.35:
                new_h = target_h
                new_s = min(1.0, s0 * sat_mul * 0.5)
                new_v = min(1.0, v0 * val_mul)
            else:
                # Rotate relative to fire orange ~28°
                delta = (target_h - 28.0) % 360.0
                new_h = (h0 + delta) % 360.0
                new_s = min(1.0, s0 * sat_mul)
                new_v = min(1.0, v0 * val_mul)
            hx[x, y] = int(new_h / 360.0 * 255) % 256
            sx[x, y] = int(max(0, min(255, new_s * 255)))
            vx[x, y] = int(max(0, min(255, new_v * 255)))
    out = Image.merge("HSV", (h, s, v)).convert("RGBA")
    out.putalpha(a)
    return out


def beat_variant(im: Image.Image, i: int, kind: str) -> Image.Image:
    """Tạo nhịp flipbook nhẹ từ frame gốc."""
    out = im.copy()
    # brightness / contrast pulse
    pulse = 0.92 + 0.08 * math.sin(i * 1.7 + (0.5 if kind == "flight" else 0))
    out = ImageEnhance.Brightness(out).enhance(pulse)
    out = ImageEnhance.Contrast(out).enhance(0.95 + 0.06 * (i % 3))
    if kind == "flight" and i % 2 == 1:
        # slight vertical squash = undulation
        w, h = out.size
        nh = max(8, int(h * (0.94 + 0.04 * (i % 2))))
        scaled = out.resize((w, nh), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        canvas.paste(scaled, (0, (h - nh) // 2), scaled)
        out = canvas
    if kind == "charge":
        # rotate vortex a bit per frame
        ang = -12 * i
        out = out.rotate(ang, resample=Image.Resampling.BICUBIC, expand=False)
    if kind == "impact" and i > 0:
        grow = 1.0 + 0.08 * i
        w, h = out.size
        nw, nh = int(w * grow), int(h * grow)
        scaled = out.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        canvas.paste(scaled, ((w - nw) // 2, (h - nh) // 2), scaled)
        out = ImageEnhance.Brightness(canvas).enhance(1.0 + 0.05 * i)
    return out


def ensure_black_bg_alpha(im: Image.Image) -> Image.Image:
    """Đảm bảo nền đen trong suốt (nếu chưa)."""
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 12 and r + g + b < 40:
                px[x, y] = (0, 0, 0, 0)
            elif r + g + b < 18 and a > 200:
                px[x, y] = (0, 0, 0, 0)
    return im


def write_pack(rel: str, target_h: float, sat: float, val: float, label: str) -> None:
    out_dir = OUT_ROOT / rel
    out_dir.mkdir(parents=True, exist_ok=True)
    seed_dir = out_dir / "qi_seed"

    def src_or_seed(stem: str, idx: int) -> Image.Image:
        # Prefer AI seed: exact frame, else seed_01 for mọi nhịp, else remap qi_fire
        exact = seed_dir / f"{stem}_{idx:02d}.png"
        seed01 = seed_dir / f"{stem}_01.png"
        if exact.exists():
            return ensure_black_bg_alpha(load_rgba(exact))
        if seed01.exists():
            return ensure_black_bg_alpha(load_rgba(seed01))
        base = SRC / f"{stem}_{idx:02d}.png"
        if not base.exists():
            base = SRC / f"{stem}_01.png"
        return remap_hue(load_rgba(base), target_h, sat, val)

    readme = [
        f"# {rel} — qi spirit (style Hỏa Long)",
        "",
        f"{label}",
        "",
        "- `charge_01..04` — vortex tụ lực",
        "- `flight_01..04` — silhouette bay (đầu bên phải)",
        "- `impact_01..03` — bùm tại đích",
        "",
        "Pipeline: `scripts/gen-qi-spirit-packs.py` từ `hon_rong/qi_fire` (+ optional `qi_seed/`).",
        "Không dùng asset VNG.",
        "",
    ]
    (out_dir / "README.md").write_text("\n".join(readme), encoding="utf-8")

    for i in range(1, CHARGE_N + 1):
        im = beat_variant(src_or_seed("charge", min(i, 4)), i - 1, "charge")
        im.save(out_dir / f"charge_{i:02d}.png")
    for i in range(1, FLIGHT_N + 1):
        im = beat_variant(src_or_seed("flight", min(i, 4)), i - 1, "flight")
        im.save(out_dir / f"flight_{i:02d}.png")
    for i in range(1, IMPACT_N + 1):
        im = beat_variant(src_or_seed("impact", min(i, 3)), i - 1, "impact")
        im.save(out_dir / f"impact_{i:02d}.png")
    print(f"OK {rel} ({label})")


def main() -> None:
    if not (SRC / "flight_01.png").exists():
        raise SystemExit(f"Missing source {SRC}/flight_01.png")
    for rel, th, sat, val, label in PACKS:
        write_pack(rel, th, sat, val, label)
    print("Done.")


if __name__ == "__main__":
    main()
