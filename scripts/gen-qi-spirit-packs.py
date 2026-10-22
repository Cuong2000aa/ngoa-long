#!/usr/bin/env python3
"""
Hue-remap CHỈ biến thể rồng từ qi_fire (cùng silhouette long).

Pack loài khác (hổ/sót/xà/thủy/lôi/phong/bagua/hồn):
  → python3 scripts/gen-qi-creature-packs.py

Usage:
  python3 scripts/gen-qi-spirit-packs.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/fx/skill/rong/qi_fire"
OUT_ROOT = ROOT / "assets/fx"

# Chỉ biến thể rồng — không đụng hổ/sót/…
PACKS = [
    ("skill/rong/qi_azure", 175, 1.05, 1.0, "Thanh Long — lam lục"),
    ("skill/rong/qi_ivory", 210, 0.22, 1.18, "Bạch Long — bạc trắng"),
]

STEMS = ("charge", "flight", "impact", "strike")
N = 24
KEY_IDX = (1, 8, 16, 24)


def load_rgba(p: Path) -> Image.Image:
    return Image.open(p).convert("RGBA")


def remap_hue(im: Image.Image, target_h: float, sat_mul: float, val_mul: float) -> Image.Image:
    src = im.convert("RGBA")
    h, s, v = src.convert("HSV").split()
    a = src.split()[3]
    hx, sx, vx = h.load(), s.load(), v.load()
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


def write_stem(dest: Path, stem: str, hue: float, sat: float, val: float) -> int:
    n = 0
    key_dir = dest / "qi_key"
    key_dir.mkdir(parents=True, exist_ok=True)
    for old in dest.glob(f"{stem}_*.png"):
        old.unlink()
    for old in key_dir.glob(f"{stem}_*.png"):
        old.unlink()
    ki = 1
    for i in range(1, N + 1):
        sp = SRC / f"{stem}_{i:02d}.png"
        if not sp.exists():
            if stem == "strike":
                sp = SRC / f"impact_{i:02d}.png"
            if not sp.exists():
                continue
        im = remap_hue(load_rgba(sp), hue, sat, val)
        im.save(dest / f"{stem}_{i:02d}.png", optimize=True)
        if i in KEY_IDX:
            im.save(key_dir / f"{stem}_{ki:02d}.png", optimize=True)
            ki += 1
        n += 1
    return n


def main() -> None:
    if not (SRC / "flight_01.png").exists():
        raise SystemExit(f"Missing qi_fire flight — chạy gen-qi-fire-serpentine.py trước ({SRC})")
    for rel, hue, sat, val, label in PACKS:
        dest = OUT_ROOT / rel
        dest.mkdir(parents=True, exist_ok=True)
        print(f"→ {rel}  ({label})")
        for stem in STEMS:
            n = write_stem(dest, stem, hue, sat, val)
            if n:
                print(f"    {stem}×{n}")
        (dest / "README.md").write_text(
            f"""# {label}

Remap palette từ `qi_fire` (cùng long). Loài khác: `gen-qi-creature-packs.py`.

Gen: `python3 scripts/gen-qi-spirit-packs.py`
""",
            encoding="utf-8",
        )
    print("done")


if __name__ == "__main__":
    main()
