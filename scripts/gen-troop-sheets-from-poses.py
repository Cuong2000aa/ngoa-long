# -*- coding: utf-8 -*-
"""
Ghép sheet 8×2 từ wiki idle + pose AI trong assets/units/sheets/_poses/.

  row0 attack: idle → wind lean → wind → strike lean → strike → follow → idle
  row1 idle: wiki tĩnh ×6 + hit xám + idle

Poses: _poses/{troop}-t{N}-{tag}.jpg|png
  infantry: raise / slash
  spear: wind / thrust
  cavalry: wind / slash
  archer: draw / release
  strategist: wind / cast
"""
from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance

# Import lib_troop_sheet for dynamic weapon VFX
SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from lib_troop_sheet import add_weapon_vfx_to_frame, hit_frame, skill_frames, scrub_bg, GROUND_Y

ROOT = Path(__file__).resolve().parents[1]
BATTLE = ROOT / "assets" / "units" / "battle"
POSE = ROOT / "assets" / "units" / "sheets" / "_poses"
SHEETS = ROOT / "assets" / "units" / "sheets"

CELL, COLS, ROWS = 128, 8, 2

MAP = {
    "infantry": ("raise", "slash"),
    "spear": ("wind", "thrust"),
    "cavalry": ("wind", "slash"),
    "archer": ("draw", "release"),
    "strategist": ("wind", "cast"),
}


def find_pose(troop: str, tier: int, tag: str) -> Path | None:
    for ext in (".jpg", ".png", ".jpeg", ".webp"):
        p = POSE / f"{troop}-t{tier}-{tag}{ext}"
        if p.exists():
            return p
    return None


scrub = scrub_bg


def fit(im: Image.Image, pad: float = 0.07) -> Image.Image:
    im = scrub(im)
    bb = im.getbbox()
    if bb:
        im = im.crop(bb)
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    mw, mh = int(CELL * (1 - 2 * pad)), int(CELL * (1 - 2 * pad))
    ratio = min(mw / max(im.width, 1), mh / max(im.height, 1))
    nw, nh = max(1, int(im.width * ratio)), max(1, int(im.height * ratio))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    # Khóa chân tại GROUND_Y (120)
    cell.paste(im, ((CELL - nw) // 2, GROUND_Y - nh), im)
    sh = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse(
        (CELL // 2 - 26, GROUND_Y - 4, CELL // 2 + 26, GROUND_Y + 4), fill=(0, 0, 0, 50)
    )
    return Image.alpha_composite(sh, cell)


def lean(im: Image.Image, a: float) -> Image.Image:
    return im.rotate(
        a,
        resample=Image.Resampling.BICUBIC,
        center=(CELL // 2, GROUND_Y),
        expand=False,
        fillcolor=(0, 0, 0, 0),
    )


def hit(im: Image.Image) -> Image.Image:
    return hit_frame(im, CELL // 2, ground_y=GROUND_Y)


def attack_row(troop: str, idle: Image.Image, wind: Image.Image, strike: Image.Image, tier: int = 1):
    if troop == "spear":
        base_frames = [idle, lean(wind, -3), wind, lean(strike, 2), strike, lean(strike, 4), idle, idle]
        dx_map = [0, 2, 4, -8, -12, -8, -3, 0]
    elif troop == "archer":
        base_frames = [idle, wind, wind, lean(strike, -2), strike, strike, idle, idle]
        dx_map = [0, 2, 3, -4, -6, -3, -1, 0]
    elif troop == "strategist":
        base_frames = [idle, lean(wind, -4), wind, lean(strike, 3), strike, lean(strike, 5), idle, idle]
        dx_map = [0, 1, 2, -5, -9, -5, -2, 0]
    elif troop == "cavalry":
        base_frames = [idle, lean(wind, -4), wind, lean(strike, 4), strike, lean(strike, 6), idle, idle]
        dx_map = [0, 2, 4, -7, -11, -7, -3, 0]
    else:  # infantry
        base_frames = [idle, lean(wind, -5), wind, lean(strike, 4), strike, lean(strike, 7), idle, idle]
        dx_map = [0, 2, 4, -7, -11, -7, -3, 0]

    out_frames = []
    for fi, fr in enumerate(base_frames):
        fr_copy = fr.copy()
        vfx = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
        add_weapon_vfx_to_frame(vfx, troop, fi, px=CELL // 2, waist_y=CELL // 2 - 4, dx=dx_map[fi], tier=tier)
        fr_copy.alpha_composite(vfx)
        out_frames.append(fr_copy)
    return out_frames


def main() -> None:
    ok = miss = 0
    for troop, (wind_s, strike_s) in MAP.items():
        for t in range(1, 7):
            wiki = BATTLE / f"wiki-{troop}-t{t}.png"
            out = SHEETS / f"{troop}-t{t}.png"
            wpath = find_pose(troop, t, wind_s)
            spath = find_pose(troop, t, strike_s)
            if not wiki.exists() or not wpath or not spath:
                print("MISS", troop, t, bool(wiki.exists()), wpath, spath)
                miss += 1
                continue
            idle = fit(Image.open(wiki))
            wind = fit(Image.open(wpath))
            strike = fit(Image.open(spath))
            atk = attack_row(troop, idle, wind, strike, tier=t)
            # Row 1: Idle (0), Idle (1), Hit (2), Idle (3), Skill (4-7)
            hit_fr = hit_frame(idle, CELL // 2, ground_y=GROUND_Y)
            sk = skill_frames(idle, CELL // 2, CELL // 2 - 4, ground_y=GROUND_Y)
            idl = [idle, idle, hit_fr, idle, sk[0], sk[1], sk[2], sk[3]]
            sheet = Image.new("RGBA", (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))
            for i, f in enumerate(atk):
                sheet.paste(f, (i * CELL, 0), f)
            for i, f in enumerate(idl):
                sheet.paste(f, (i * CELL, CELL), f)
            sheet.save(out, "PNG", optimize=True)
            ok += 1
            print("OK", out.name)
    print(f"done ok={ok} miss={miss}")


if __name__ == "__main__":
    main()
