#!/usr/bin/env python3
"""
Mở rộng mọi flipbook FX (không phải qi skill) → ≥24 frame / stem.

In-place từng folder — giữ hình tượng gốc, không hue-remap chéo pack.
Áp dụng: itch/*/*/ · forge/*/ · slash/ · whirlwind/ · particles/ (stem combat).

Usage:
  python3 scripts/expand-fx-flipbook.py
"""
from __future__ import annotations

import math
import random
import re
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
FX = ROOT / "assets/fx"
TARGET = 24
KEY_DIR = "fx_key"

# Bỏ qua qi skill (đã expand riêng) + backup
SKIP_DIR_NAMES = {"qi_key", KEY_DIR, "skill"}

# particles: chỉ stem dùng combat (tránh expand mọi particle lẻ)
PARTICLE_STEMS = {
    "slash",
    "muzzle",
    "flame",
    "spark",
    "smoke",
    "circle",
    "dirt",
    "magic",
    "star",
    "trace",
    "twirl",
    "light",
    "fire",
}

FRAME_RE = re.compile(r"^(?P<stem>.+)_(?P<num>\d{2})$")


def load_rgba(p: Path) -> Image.Image:
    return Image.open(p).convert("RGBA")


def blend(a: Image.Image, b: Image.Image, t: float) -> Image.Image:
    t = max(0.0, min(1.0, t))
    if t <= 0.001:
        return a.copy()
    if t >= 0.999:
        return b.copy()
    return Image.blend(a, b, t)


def warp_undulate(im: Image.Image, phase: float, amp: float = 2.0) -> Image.Image:
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
            sx, sy = x - dx, y - dy
            if 0 <= sx < w and 0 <= sy < h:
                op[x, y] = px[sx, sy]
    return out


def flicker(im: Image.Image, seed: int, strength: float = 0.06) -> Image.Image:
    rng = random.Random(seed)
    out = ImageEnhance.Brightness(im.copy()).enhance(1.0 + strength * math.sin(seed * 0.7))
    px = out.load()
    w, h = out.size
    for _ in range(12):
        x = rng.randint(0, w - 1)
        y = rng.randint(0, h - 1)
        r, g, b, a = px[x, y]
        if a < 40:
            continue
        boost = rng.randint(15, 40)
        px[x, y] = (min(255, r + boost), min(255, g + boost), min(255, b + boost // 2), a)
    return out


def normalize_size(keys: list[Image.Image]) -> list[Image.Image]:
    """Đồng kích thước trước blend (một số pack itch lệch size giữa frame)."""
    if not keys:
        return keys
    w = max(im.width for im in keys)
    h = max(im.height for im in keys)
    out: list[Image.Image] = []
    for im in keys:
        if im.size == (w, h):
            out.append(im)
            continue
        canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        scaled = im.resize((w, h), Image.Resampling.LANCZOS)
        canvas.paste(scaled, (0, 0), scaled)
        out.append(canvas)
    return out


def expand_stem(keys: list[Image.Image], target_n: int, stem: str) -> list[Image.Image]:
    keys = normalize_size(keys)
    segs = len(keys)
    frames: list[Image.Image] = []
    for i in range(target_n):
        if segs == 1:
            base = keys[0].copy()
            phase = i / target_n
            fr = warp_undulate(base, phase, amp=1.4)
            fr = flicker(fr, seed=i * 19 + hash(stem) % 1000, strength=0.05)
            frames.append(fr)
            continue
        pos = (i / target_n) * segs
        i0 = int(pos) % segs
        i1 = (i0 + 1) % segs
        t = pos - int(pos)
        te = t * t * (3 - 2 * t)
        base = blend(keys[i0], keys[i1], te)
        phase = i / target_n
        fr = warp_undulate(base, phase, amp=2.0)
        fr = flicker(fr, seed=i * 17 + hash(stem) % 1000)
        frames.append(fr)
    return frames


def group_frames(folder: Path) -> dict[str, list[Path]]:
    groups: dict[str, list[tuple[int, Path]]] = {}
    for p in folder.glob("*.png"):
        m = FRAME_RE.match(p.stem)
        if not m:
            continue
        stem, num = m.group("stem"), int(m.group("num"))
        groups.setdefault(stem, []).append((num, p))
    out: dict[str, list[Path]] = {}
    for stem, items in groups.items():
        items.sort(key=lambda x: x[0])
        out[stem] = [p for _, p in items]
    return out


def save_frames(folder: Path, stem: str, frames: list[Image.Image]) -> None:
    for old in folder.glob(f"{stem}_*.png"):
        old.unlink()
    for i, fr in enumerate(frames, start=1):
        fr.save(folder / f"{stem}_{i:02d}.png", optimize=True)


def backup_keys(folder: Path, stem: str, paths: list[Path]) -> Path:
    key_dir = folder / KEY_DIR
    key_dir.mkdir(parents=True, exist_ok=True)
    for i, p in enumerate(paths, start=1):
        dp = key_dir / f"{stem}_{i:02d}.png"
        if not dp.exists():
            Image.open(p).convert("RGBA").save(dp)
    return key_dir


def expand_folder(folder: Path, only_stems: set[str] | None = None) -> int:
    groups = group_frames(folder)
    n_done = 0
    for stem, paths in sorted(groups.items()):
        if only_stems is not None and stem not in only_stems:
            continue
        if len(paths) >= TARGET:
            continue
        # ưu tiên key backup nếu đã có
        key_dir = folder / KEY_DIR
        key_paths = []
        if key_dir.is_dir():
            kp = sorted(key_dir.glob(f"{stem}_*.png"), key=lambda p: p.name)
            if kp:
                key_paths = kp
        if not key_paths:
            key_paths = paths
            backup_keys(folder, stem, paths)
            key_dir = folder / KEY_DIR
            key_paths = sorted(key_dir.glob(f"{stem}_*.png"), key=lambda p: p.name)

        keys = [load_rgba(p) for p in key_paths]
        print(f"  {folder.relative_to(ROOT)}/{stem}: {len(keys)} → {TARGET}")
        frames = expand_stem(keys, TARGET, stem)
        save_frames(folder, stem, frames)
        n_done += 1
    return n_done


def iter_pack_dirs() -> list[tuple[Path, set[str] | None]]:
    out: list[tuple[Path, set[str] | None]] = []

    # itch: mỗi pack folder chứa frame_*.png
    itch = FX / "itch"
    if itch.is_dir():
        for family in sorted(itch.iterdir()):
            if not family.is_dir():
                continue
            for pack in sorted(family.iterdir()):
                if pack.is_dir() and pack.name not in SKIP_DIR_NAMES:
                    out.append((pack, None))

    # forge
    forge = FX / "forge"
    if forge.is_dir():
        for pack in sorted(forge.iterdir()):
            if pack.is_dir() and pack.name not in SKIP_DIR_NAMES:
                out.append((pack, None))

    # slash / whirlwind — stem dài nằm trực tiếp trong folder
    for name in ("slash", "whirlwind"):
        d = FX / name
        if d.is_dir():
            out.append((d, None))

    # particles — chỉ stem combat
    particles = FX / "particles"
    if particles.is_dir():
        out.append((particles, PARTICLE_STEMS))

    return out


def main() -> None:
    total = 0
    for folder, only in iter_pack_dirs():
        print(f"→ {folder.relative_to(ROOT)}")
        total += expand_folder(folder, only)
    print(f"done — expanded {total} stems → ×{TARGET}")


if __name__ == "__main__":
    main()
