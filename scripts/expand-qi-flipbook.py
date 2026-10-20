#!/usr/bin/env python3
"""
Mở rộng flipbook qi_* — giữ hình tượng từng pack, chỉ nội suy thêm frame.

Mỗi folder skill/*/qi_* expand độc lập từ keyframe riêng
(charge×4 · flight×4 · impact×3 · strike×3 nếu có) → ≥24 frame.
Không hue-remap từ rồng sang pack khác.

Usage:
  python3 scripts/expand-qi-flipbook.py
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "assets/fx/skill"

# stem → (key_n gốc, target_n ≥ 24)
EXPAND = {
    "charge": (4, 24),
    "flight": (4, 24),
    "impact": (3, 24),
    "strike": (3, 24),  # chỉ pack có strike_*.png
}


def load_rgba(p: Path) -> Image.Image:
    return Image.open(p).convert("RGBA")


def blend(a: Image.Image, b: Image.Image, t: float) -> Image.Image:
    t = max(0.0, min(1.0, t))
    if t <= 0.001:
        return a.copy()
    if t >= 0.999:
        return b.copy()
    return Image.blend(a, b, t)


def warp_undulate(im: Image.Image, phase: float, amp: float = 3.2) -> Image.Image:
    """Sóng nhẹ — thêm motion giữa key, không đổi silhouette gốc."""
    src = im
    w, h = src.size
    px = src.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            along = 1.0 - x / max(1, w - 1)
            dy = int(amp * along * math.sin(phase * math.tau + x * 0.045 + y * 0.02))
            dx = int(amp * 0.35 * along * math.sin(phase * math.tau * 1.3 + y * 0.06))
            sx = x - dx
            sy = y - dy
            if 0 <= sx < w and 0 <= sy < h:
                op[x, y] = px[sx, sy]
    return out


def flicker(im: Image.Image, seed: int, strength: float = 0.08) -> Image.Image:
    rng = random.Random(seed)
    out = im.copy()
    factor = 1.0 + strength * math.sin(seed * 0.7)
    out = ImageEnhance.Brightness(out).enhance(factor)
    px = out.load()
    w, h = out.size
    for _ in range(18):
        x = rng.randint(0, w - 1)
        y = rng.randint(0, h - 1)
        r, g, b, a = px[x, y]
        if a < 40:
            continue
        boost = rng.randint(20, 55)
        px[x, y] = (
            min(255, r + boost),
            min(255, g + boost),
            min(255, b + boost // 2),
            a,
        )
    return out


def expand_stem(folder: Path, stem: str, key_n: int, target_n: int) -> list[Image.Image]:
    keys: list[Image.Image] = []
    for i in range(1, key_n + 1):
        p = folder / f"{stem}_{i:02d}.png"
        if not p.exists():
            raise SystemExit(f"Missing keyframe {p}")
        keys.append(load_rgba(p))

    segs = len(keys)
    frames: list[Image.Image] = []
    for i in range(target_n):
        pos = (i / target_n) * segs
        i0 = int(pos) % segs
        i1 = (i0 + 1) % segs
        t = pos - int(pos)
        te = t * t * (3 - 2 * t)
        base = blend(keys[i0], keys[i1], te)
        phase = i / target_n
        amp = 2.4 if stem == "flight" else 1.6 if stem == "charge" else 2.0
        fr = warp_undulate(base, phase, amp=amp)
        fr = flicker(fr, seed=i * 17 + hash(stem) % 1000, strength=0.06 if stem != "impact" else 0.1)
        if stem == "flight":
            stretch = 1.0 + 0.03 * math.sin(phase * math.tau)
            nw = max(8, int(fr.width * stretch))
            fr = fr.resize((nw, fr.height), Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", keys[0].size, (0, 0, 0, 0))
            ox = keys[0].width - fr.width
            canvas.paste(fr, (ox, 0), fr)
            fr = canvas
        frames.append(fr)
    return frames


def save_frames(folder: Path, stem: str, frames: list[Image.Image]) -> None:
    for old in folder.glob(f"{stem}_*.png"):
        old.unlink()
    for i, fr in enumerate(frames, start=1):
        fr.save(folder / f"{stem}_{i:02d}.png", optimize=True)


def pack_dirs() -> list[Path]:
    out: list[Path] = []
    for p in sorted(SKILL.rglob("qi_*")):
        if not p.is_dir():
            continue
        if p.name == "qi_key":
            continue
        # chỉ folder có charge/flight key
        if (p / "charge_01.png").exists() or (p / "qi_key" / "charge_01.png").exists():
            out.append(p)
    return out


def key_source(folder: Path, stem: str, key_n: int) -> Path | None:
    """Ưu tiên qi_key/ backup; fallback frame 01..key_n trong folder."""
    key_dir = folder / "qi_key"
    if (key_dir / f"{stem}_01.png").exists():
        return key_dir
    if (folder / f"{stem}_01.png").exists():
        # chỉ dùng nếu còn đúng số key (chưa expand) — hoặc lấy 01..key_n
        return folder
    return None


def expand_pack(folder: Path) -> None:
    rel = folder.relative_to(ROOT)
    print(f"→ {rel}")
    for stem, (key_n, target_n) in EXPAND.items():
        src = key_source(folder, stem, key_n)
        if src is None:
            continue
        # thiếu đủ key → bỏ stem (vd pack không có strike)
        if not all((src / f"{stem}_{i:02d}.png").exists() for i in range(1, key_n + 1)):
            if stem == "strike":
                continue
            raise SystemExit(f"Incomplete keys for {folder}/{stem}")
        # lần đầu: backup key vào qi_key/ nếu chưa có
        key_dir = folder / "qi_key"
        if src is folder and not (key_dir / f"{stem}_01.png").exists():
            key_dir.mkdir(parents=True, exist_ok=True)
            for i in range(1, key_n + 1):
                sp = folder / f"{stem}_{i:02d}.png"
                dp = key_dir / f"{stem}_{i:02d}.png"
                if sp.exists() and not dp.exists():
                    Image.open(sp).save(dp)
            src = key_dir
            print(f"  backed up {stem} keys → qi_key/")
        print(f"  expand {stem}: {key_n} → {target_n}")
        frames = expand_stem(src, stem, key_n, target_n)
        save_frames(folder, stem, frames)


def main() -> None:
    packs = pack_dirs()
    if not packs:
        raise SystemExit(f"No qi_* packs under {SKILL}")
    for folder in packs:
        expand_pack(folder)
    print("done")


if __name__ == "__main__":
    main()
