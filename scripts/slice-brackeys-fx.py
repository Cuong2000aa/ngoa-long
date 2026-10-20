#!/usr/bin/env python3
"""Slice Brackeys VFX Bundle atlases → assets/fx/itch/brackeys/{pack}/frame_XX.png

Run after `npm run import:itch-fx` has unpacked brackeys_vfx_bundle.
"""
from __future__ import annotations

import re
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "fx" / "itch" / "brackeys_vfx_bundle"
OUT = ROOT / "assets" / "fx" / "itch" / "brackeys"

MAP = {
    "ember_burst": "004_fire_ring_6x5.png",
    "blood_burst": "006_blood_impact_6x5.png",
    "storm_burst": "009_electric_ring_6x5.png",
    "arcane_burst": "000_wavy_purple_6x5.png",
    "radiance_aura": "001_star_explosion_6x5.png",
    "ward_barrier": "008_wavy_blue_6x5.png",
    "shadow_burst": "010_vortex_6x5.png",
    "earth_burst": "011_charge_7x6.png",
    "hit_burst": "002_big_hit_6x5.png",
    "explosion_burst": "003_explosion_6x5.png",
    "fire_point": "012_fire_point_6x5.png",
    "dithered_fire": "013_dithered_fire_6x5.png",
    "water_wave": "008_wavy_blue_6x5.png",
    "lightstreaks": "005_lightstreaks_6x5.png",
    "impact_white": "007_impact_white_6x4.png",
}

GRID_RE = re.compile(r"_(\d+)x(\d+)\.png$", re.I)


def slice_atlas(src: Path, dest: Path, max_frames: int = 24) -> int:
    m = GRID_RE.search(src.name)
    if not m:
        raise ValueError(f"no grid in {src.name}")
    cols, rows = int(m.group(1)), int(m.group(2))
    im = Image.open(src).convert("RGBA")
    fw, fh = im.width // cols, im.height // rows
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    n = 0
    for r in range(rows):
        for c in range(cols):
            if n >= max_frames:
                break
            frame = im.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh))
            if frame.split()[-1].getextrema()[1] < 8:
                continue
            n += 1
            frame.save(dest / f"frame_{n:02d}.png")
        if n >= max_frames:
            break
    return n


def main() -> None:
    if not SRC.is_dir():
        print(f"Missing {SRC} — import brackeys zip first")
        return
    OUT.mkdir(parents=True, exist_ok=True)
    for pack, fname in MAP.items():
        src = SRC / fname
        if not src.exists():
            print("MISSING", fname)
            continue
        n = slice_atlas(src, OUT / pack)
        print(f"OK {pack} ← {fname} ({n} frames)")


if __name__ == "__main__":
    main()
