#!/usr/bin/env python3
"""Import CodeManu Free VFX Pack (OGA CC0) + SpritePilot effects → itch folders for hồn.

Sources (auto-downloadable):
  - https://opengameart.org/sites/default/files/vfx_free_pack.zip
  - https://spritepilot.com/free-assets/effects/*

Usage:
  # zip already at _dl/itch-fx/fetch/vfx_free_pack.zip
  python3 scripts/import-codemanu-hon-fx.py
"""
from __future__ import annotations

import re
import zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FETCH = ROOT / "_dl" / "itch-fx" / "fetch"
ZIP = FETCH / "vfx_free_pack.zip"
SP_STRIPS = FETCH / "sp-strips"
OUT_CM = ROOT / "assets" / "fx" / "itch" / "codemanu"
OUT_SP = ROOT / "assets" / "fx" / "itch" / "spritepilot"
CREDITS = ROOT / "assets" / "CREDITS.md"

# Effect → curated pack id (hon charge / trail / hit)
EFFECTS: dict[str, str] = {
    "Effect_Charged": "charged",
    "Effect_TheVortex": "vortex",
    "Effect_DitheredFire": "dithered_fire",
    "Effect_FastPixelFire": "pixel_fire",
    "Effect_Magma": "magma",
    "Effect_Explosion": "explosion",
    "Effect_Explosion2": "explosion2",
    "Effect_Kabooms": "kabooms",
    "Effect_Anima": "anima",
    "Effect_Constellation": "constellation",
    "Effect_PuffAndStars": "puff_stars",
    "Effect_ElectricShield": "electric_shield",
    "Effect_Tentacles": "tentacles",
    "Effect_Worm": "worm",
    "Effect_Hyperspeed": "hyperspeed",
    "Effect_EldenRing": "elden_ring",
    "Effect_Impact": "impact",
    "Effect_BigHit": "big_hit",
    "Effect_Wheel": "wheel",
    "Effect_PowerChords": "power_chords",
}

# Keep ~16 frames max for runtime (subsample long anims)
MAX_FRAMES = 16


def pad(i: int) -> str:
    return f"{i:02d}"


def import_codemanu() -> list[str]:
    if not ZIP.exists():
        raise SystemExit(f"Missing {ZIP} — download OGA vfx_free_pack.zip first")
    OUT_CM.mkdir(parents=True, exist_ok=True)
    imported: list[str] = []
    with zipfile.ZipFile(ZIP, "r") as zf:
        by_effect: dict[str, list[str]] = {k: [] for k in EFFECTS}
        for name in zf.namelist():
            for effect, slug in EFFECTS.items():
                prefix = f"{effect}/30fps/Frames/"
                if name.startswith(prefix) and name.endswith(".png") and "__MACOSX" not in name:
                    by_effect[effect].append(name)
        for effect, slug in EFFECTS.items():
            names = sorted(by_effect[effect])
            if not names:
                print(f"WARN missing {effect}")
                continue
            # subsample evenly to MAX_FRAMES
            if len(names) > MAX_FRAMES:
                step = len(names) / MAX_FRAMES
                names = [names[int(i * step)] for i in range(MAX_FRAMES)]
            dest = OUT_CM / slug
            if dest.exists():
                for p in dest.glob("*.png"):
                    p.unlink()
            else:
                dest.mkdir(parents=True)
            for i, n in enumerate(names, 1):
                (dest / f"frame_{pad(i)}.png").write_bytes(zf.read(n))
            print(f"OK codemanu/{slug} ({len(names)} frames)")
            imported.append(slug)
    return imported


def slice_strip(src: Path, dest_dir: Path, frame_w: int | None = None) -> int:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    fw = frame_w or h  # square frames in a row
    n = w // fw
    dest_dir.mkdir(parents=True, exist_ok=True)
    for p in dest_dir.glob("frame_*.png"):
        p.unlink()
    for i in range(n):
        frame = im.crop((i * fw, 0, (i + 1) * fw, h))
        frame.save(dest_dir / f"frame_{pad(i + 1)}.png")
    return n


def import_spritepilot() -> list[str]:
    OUT_SP.mkdir(parents=True, exist_ok=True)
    packs: list[str] = []
    strips = {
        "explosion": "explosion-32px_strip10.png",
        "smoke_puff": "smoke-puff-32px_strip8.png",
        "landing_dust": "landing-dust-32px_strip7.png",
        "hit_spark": "hit-spark-32px_strip6.png",
        "fire": "fire-32px_strip8.png",
        "water_splash": "water-splash-32px_strip9.png",
        "magic_sparkle": "magic-sparkle-32px_strip8.png",
    }
    for slug, fname in strips.items():
        src = SP_STRIPS / fname
        if not src.exists():
            print(f"WARN missing strip {src}")
            continue
        n = slice_strip(src, OUT_SP / slug)
        print(f"OK spritepilot/{slug} ({n} frames)")
        packs.append(slug)
    return packs


def update_credits(cm: list[str], sp: list[str]) -> None:
    if not CREDITS.exists():
        return
    text = CREDITS.read_text(encoding="utf-8")
    block = (
        "## CodeManu + SpritePilot (hồn upgrade)\n"
        "- **CodeManu Free VFX Pack** — CC0 — https://opengameart.org/content/free-vfx-asset-pack\n"
        f"  → `assets/fx/itch/codemanu/{{{' , '.join(cm)}}}/` (30fps subsampled)\n"
        "- **SpritePilot Free Effects** — CC0 — https://spritepilot.com/free-game-assets/effects\n"
        f"  → `assets/fx/itch/spritepilot/{{{' , '.join(sp)}}}/`\n"
    )
    marker = "## CodeManu + SpritePilot (hồn upgrade)"
    if marker in text:
        text = re.sub(
            rf"{re.escape(marker)}.*?(?=\n## |\Z)",
            block + "\n",
            text,
            flags=re.S,
        )
    else:
        text = text.rstrip() + "\n\n" + block + "\n"
    CREDITS.write_text(text, encoding="utf-8")
    print("Updated assets/CREDITS.md")


def main() -> None:
    cm = import_codemanu()
    sp = import_spritepilot()
    update_credits(cm, sp)
    print(f"Done: {len(cm)} codemanu + {len(sp)} spritepilot packs")


if __name__ == "__main__":
    main()
