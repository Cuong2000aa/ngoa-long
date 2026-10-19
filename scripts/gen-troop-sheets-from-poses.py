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

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance

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


def scrub(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r > 232 and g > 232 and b > 232:
                px[x, y] = (0, 0, 0, 0)
    vis: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])
    for s in q:
        vis.add(s)
    while q:
        x, y = q.popleft()
        r, g, b, a = px[x, y]
        if (r + g + b) / 3 > 195 or a < 20:
            px[x, y] = (0, 0, 0, 0)
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in vis:
                    vis.add((nx, ny))
                    nr, ng, nb, na = px[nx, ny]
                    if (nr + ng + nb) / 3 > 180 or na < 40:
                        q.append((nx, ny))
    return im


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
    cell.paste(im, ((CELL - nw) // 2, CELL - nh - int(CELL * 0.04)), im)
    sh = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse(
        (CELL // 2 - 26, CELL - 14, CELL // 2 + 26, CELL - 4), fill=(0, 0, 0, 65)
    )
    return Image.alpha_composite(sh, cell)


def lean(im: Image.Image, a: float) -> Image.Image:
    return im.rotate(
        a,
        resample=Image.Resampling.BICUBIC,
        center=(CELL // 2, CELL - 8),
        expand=False,
        fillcolor=(0, 0, 0, 0),
    )


def hit(im: Image.Image) -> Image.Image:
    g = ImageEnhance.Color(im.convert("RGB")).enhance(0.2).convert("RGBA")
    g.putalpha(im.split()[-1])
    return g


def attack_row(troop: str, idle: Image.Image, wind: Image.Image, strike: Image.Image):
    if troop == "spear":
        return [idle, lean(wind, -3), wind, lean(strike, 2), strike, lean(strike, 5), idle, idle]
    if troop == "archer":
        return [idle, wind, wind, lean(strike, -2), strike, strike, idle, idle]
    if troop == "strategist":
        return [idle, lean(wind, -4), wind, lean(strike, 3), strike, lean(strike, 6), idle, idle]
    if troop == "cavalry":
        return [idle, lean(wind, -4), wind, lean(strike, 4), strike, lean(strike, 8), idle, idle]
    return [idle, lean(wind, -5), wind, lean(strike, 5), strike, lean(strike, 10), idle, idle]


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
            atk = attack_row(troop, idle, wind, strike)
            idl = [idle] * 6 + [hit(idle), idle]
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
