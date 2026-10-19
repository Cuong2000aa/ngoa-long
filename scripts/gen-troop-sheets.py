# -*- coding: utf-8 -*-
"""
Từ icon wiki (PNG) → sprite sheet 8×2 — timing kiểu SRPG (FE / Triangle Strategy / Ngọa Long):
  row0 attack: windup → lunge → slash → impact flash → recover
  row1 idle bob + skill cast pulse
Không vẽ nhân vật mới — chỉ biến đổi icon wiki player.
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
BATTLE = ROOT / "assets" / "units" / "battle"
SHEETS = ROOT / "assets" / "units" / "sheets"
SHEETS.mkdir(parents=True, exist_ok=True)

COLS = 8
ROWS = 2
CELL = 128


def fit_icon(im: Image.Image, size: int = CELL) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            if r < 14 and g < 14 and b < 14:
                px[x, y] = (0, 0, 0, 0)
            elif r > 248 and g > 248 and b > 248:
                px[x, y] = (0, 0, 0, 0)
    box = im.getbbox() or (0, 0, w, h)
    im = im.crop(box)
    im.thumbnail((size - 10, size - 10), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = (size - im.width) // 2
    oy = size - im.height - 4
    canvas.paste(im, (ox, oy), im)
    return canvas


def shift(im: Image.Image, dx: int, dy: int) -> Image.Image:
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (dx, dy), im)
    return out


def scale_about_feet(im: Image.Image, sx: float, sy: float) -> Image.Image:
    w, h = im.size
    nw, nh = max(1, int(w * sx)), max(1, int(h * sy))
    scaled = im.resize((nw, nh), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ox = (w - nw) // 2
    oy = h - nh
    out.paste(scaled, (ox, oy), scaled)
    return out


def rotate_about_feet(im: Image.Image, deg: float) -> Image.Image:
    """Xoay nhẹ quanh chân — windup / slash (pattern FE attack foreshortening)."""
    w, h = im.size
    # pad rồi rotate, crop lại chân sát đáy
    pad = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0))
    pad.paste(im, (20, 20), im)
    rot = pad.rotate(deg, resample=Image.Resampling.BICUBIC, expand=False)
    # lấy vùng giữa
    cx, cy = rot.size[0] // 2, rot.size[1] // 2
    box = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    cropped = rot.crop(box)
    # re-anchor feet
    bb = cropped.getbbox()
    if not bb:
        return im.copy()
    body = cropped.crop(bb)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ox = (w - body.width) // 2
    oy = h - body.height - 2
    out.paste(body, (ox, max(0, oy)), body)
    return out


def tint(im: Image.Image, rgb: tuple[int, int, int], strength: float) -> Image.Image:
    overlay = Image.new("RGBA", im.size, (*rgb, int(255 * strength)))
    base = im.copy()
    r, g, b, a = base.split()
    over = Image.blend(base, Image.composite(overlay, base, a), strength)
    over.putalpha(a)
    return over


def brighten(im: Image.Image, factor: float) -> Image.Image:
    rgb = im.convert("RGB")
    enh = ImageEnhance.Brightness(rgb).enhance(factor)
    out = enh.convert("RGBA")
    out.putalpha(im.split()[-1])
    return out


def make_sheet(icon_path: Path, out_path: Path) -> None:
    src = Image.open(icon_path)
    base = fit_icon(src, CELL)

    frames: list[Image.Image] = []
    # --- row0 attack (SRPG: windup → commit → impact → recover) ---
    frames.append(base)  # 0 ready
    frames.append(rotate_about_feet(scale_about_feet(shift(base, -4, 1), 0.96, 1.04), 8))  # 1 windup
    frames.append(rotate_about_feet(scale_about_feet(shift(base, -8, 0), 0.94, 1.06), 12))  # 2 coil
    frames.append(rotate_about_feet(scale_about_feet(shift(base, 12, -3), 1.14, 0.9), -10))  # 3 commit
    frames.append(brighten(rotate_about_feet(scale_about_feet(shift(base, 18, -4), 1.18, 0.88), -14), 1.25))  # 4 peak
    frames.append(tint(scale_about_feet(shift(base, 10, -1), 1.08, 0.96), (255, 220, 120), 0.35))  # 5 impact
    frames.append(scale_about_feet(shift(base, 4, 0), 1.02, 0.99))  # 6 recover
    frames.append(base)  # 7 settle

    # --- row1 idle + skill ---
    frames.append(shift(base, 0, 0))
    frames.append(shift(base, 0, -2))
    frames.append(shift(base, 1, -4))
    frames.append(shift(base, 0, -1))
    frames.append(tint(shift(base, 0, -5), (180, 210, 255), 0.22))
    frames.append(tint(scale_about_feet(shift(base, 0, -9), 1.08, 1.08), (255, 210, 100), 0.32))
    frames.append(brighten(tint(scale_about_feet(shift(base, 0, -7), 1.12, 1.1), (255, 240, 160), 0.4), 1.15))
    frames.append(tint(shift(base, 0, -2), (200, 230, 255), 0.12))

    sheet = Image.new("RGBA", (CELL * COLS, CELL * ROWS), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        col, row = i % COLS, i // COLS
        sheet.paste(fr, (col * CELL, row * CELL), fr)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, "PNG")
    print("OK", out_path.name, sheet.size)


def main() -> None:
    types = ["infantry", "spear", "cavalry", "archer", "strategist"]
    index = {}
    for t in types:
        index[t] = {}
        for tier in range(1, 7):
            icon = BATTLE / f"wiki-{t}-t{tier}.png"
            if not icon.exists():
                print("skip missing", icon.name)
                continue
            out = SHEETS / f"{t}-t{tier}.png"
            if t == "cavalry" and tier >= 5 and (SHEETS / "hobao-ky.png").exists():
                index[t][str(tier)] = {
                    "sheet": "assets/units/sheets/hobao-ky.png",
                    "cols": 8,
                    "rows": 2,
                    "kind": "hobao",
                    "icon": f"assets/units/battle/wiki-{t}-t{tier}.png",
                }
                print("use hobao sheet for", t, "t", tier)
                continue
            make_sheet(icon, out)
            index[t][str(tier)] = {
                "sheet": f"assets/units/sheets/{t}-t{tier}.png",
                "cols": COLS,
                "rows": ROWS,
                "kind": "wiki-derived",
                "icon": f"assets/units/battle/wiki-{t}-t{tier}.png",
            }
    (SHEETS / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print("wrote", SHEETS / "index.json")


if __name__ == "__main__":
    main()
