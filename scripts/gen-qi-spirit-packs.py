#!/usr/bin/env python3
"""
Gen qi_* spirit packs từ skill/rong/qi_fire (cùng style SRPG).

Usage:
  python3 scripts/gen-qi-spirit-packs.py
"""
from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/fx/skill/rong/qi_fire"
OUT_ROOT = ROOT / "assets/fx"

# (rel_dir under assets/fx, target_hue, sat_mul, val_mul, label)
PACKS = [
    ("skill/xa/qi_poison", 130, 1.05, 0.95, "Độc xà — lục độc"),
    ("skill/thuy/qi_water", 198, 1.1, 1.0, "Thủy hồn — lam nước"),
    ("skill/loi/qi_thunder", 52, 1.25, 1.12, "Lôi long — vàng sét"),
    ("skill/phong/qi_wind", 185, 0.85, 1.08, "Phong hồn — cyan gió"),
    ("skill/rong/qi_azure", 175, 1.05, 1.0, "Thanh Long — lam lục"),
    ("skill/rong/qi_ivory", 210, 0.22, 1.18, "Bạch Long — bạc trắng"),
    ("skill/ho/qi_tiger", 38, 1.15, 1.05, "Hổ — hổ phách"),
    ("skill/soi/qi_wolf", 220, 0.35, 1.1, "Sói — xám bạc"),
    ("skill/bagua/qi_bagua", 50, 1.0, 1.0, "Pháp trận Bát Quái — đa màu"),
    ("skill/hon/qi_soul", 210, 0.55, 1.1, "Linh hồn người — cyan/tím/bạc"),
]

# Đồng bộ với expand-qi-flipbook.py (≥24 frame / stem)
CHARGE_N = 24
FLIGHT_N = 24
IMPACT_N = 24


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
    for y in range(hh):
        for x in range(w):
            if a.getpixel((x, y)) < 8:
                continue
            h0 = hx[x, y] / 255.0 * 360.0
            s0 = sx[x, y] / 255.0
            v0 = vx[x, y] / 255.0
            if v0 > 0.92 and s0 < 0.35:
                new_h = target_h
                new_s = min(1.0, s0 * sat_mul * 0.5)
                new_v = min(1.0, v0 * val_mul)
            else:
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


def stem_frames(folder: Path, stem: str, n: int) -> list[Path]:
    return [folder / f"{stem}_{i:02d}.png" for i in range(1, n + 1)]


def copy_or_remap(
    src_frames: list[Path],
    dest_dir: Path,
    stem: str,
    hue: float,
    sat: float,
    val: float,
    seed_only: bool,
) -> None:
    dest_dir.mkdir(parents=True, exist_ok=True)
    seed = dest_dir / "qi_seed"
    if seed_only and seed.is_dir() and any(seed.iterdir()):
        # Keep existing generated frames if present
        existing = list(dest_dir.glob(f"{stem}_*.png"))
        if len(existing) >= len(src_frames):
            return
    for i, sp in enumerate(src_frames, start=1):
        if not sp.exists():
            continue
        dp = dest_dir / f"{stem}_{i:02d}.png"
        if seed_only:
            # bagua/soul: copy fire as placeholder only if missing
            if not dp.exists():
                shutil.copy2(sp, dp)
            continue
        im = remap_hue(load_rgba(sp), hue, sat, val)
        im.save(dp)


def main() -> None:
    if not SRC.is_dir():
        raise SystemExit(f"Missing source {SRC}")
    charge = stem_frames(SRC, "charge", CHARGE_N)
    flight = stem_frames(SRC, "flight", FLIGHT_N)
    impact = stem_frames(SRC, "impact", IMPACT_N)
    for rel, hue, sat, val, label in PACKS:
        dest = OUT_ROOT / rel
        seed_only = "bagua" in rel or "qi_soul" in rel
        print(f"→ {rel}  ({label})")
        copy_or_remap(charge, dest, "charge", hue, sat, val, seed_only)
        copy_or_remap(flight, dest, "flight", hue, sat, val, seed_only)
        copy_or_remap(impact, dest, "impact", hue, sat, val, seed_only)
        # bagua strike optional
        if "bagua" in rel:
            for i, sp in enumerate(impact, start=1):
                if sp.exists():
                    dp = dest / f"strike_{i:02d}.png"
                    if not dp.exists():
                        shutil.copy2(sp, dp)
    print("done")


if __name__ == "__main__":
    main()
