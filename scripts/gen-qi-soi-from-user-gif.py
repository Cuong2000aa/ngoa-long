#!/usr/bin/env python3
"""
Sói (soi) — gen flight từ GIF mẫu user (cyan spirit, chiêu không gallop).

Nguồn: assets/fx/skill/soi/qi_wolf/_ref_soi_user.gif
Expand 8 frame → flight_01..24 (tụ → stream lao → tan).

Usage:
  python3 scripts/gen-qi-soi-from-user-gif.py
"""
from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageSequence

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets/fx/skill/soi/qi_wolf"
SRC = DEST / "_ref_soi_user.gif"
# fallback: cursor assets drop
SRC_FALLBACK = Path(
    "/Users/it/.cursor/projects/Users-it-Documents-3Q/assets/MVWEy-21c12c18-c4f9-4801-bc46-16d6783bca0d.gif"
)

W, H, N = 384, 192, 24
RGB = (140, 220, 255)
KEY_IDX = (1, 8, 16, 24)


def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def smoothstep(t: float) -> float:
    t = clamp(t, 0, 1)
    return t * t * (3 - 2 * t)


def composite_gif(path: Path) -> list[Image.Image]:
    im = Image.open(path)
    canvas = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out: list[Image.Image] = []
    for fr in ImageSequence.Iterator(im):
        fr = fr.convert("RGBA")
        dispose = fr.info.get("disposal", 1)
        layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
        layer.paste(fr, (0, 0))
        if dispose == 2:
            canvas = Image.new("RGBA", im.size, (0, 0, 0, 0))
        canvas = Image.alpha_composite(canvas, layer)
        out.append(canvas.copy())
    return out


def knockout_black(im: Image.Image, thr: int = 22) -> Image.Image:
    src = im.convert("RGBA")
    px = src.load()
    w, h = src.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            lum = (r + g + b) / 3
            if lum <= thr:
                px[x, y] = (r, g, b, 0)
            elif lum < thr + 36:
                t = (lum - thr) / 36.0
                px[x, y] = (r, g, b, int(min(a, 255 * t)))
    return src


def fit_canvas(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    bbox = im.split()[3].getbbox()
    if not bbox:
        return Image.new("RGBA", (W, H), (0, 0, 0, 0))
    x0, y0, x1, y1 = bbox
    pad = 6
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(im.size[0], x1 + pad), min(im.size[1], y1 + pad)
    crop = im.crop((x0, y0, x1, y1))
    cw, ch = crop.size
    scale = min((W * 0.88) / cw, (H * 0.86) / ch)
    nw, nh = max(8, int(cw * scale)), max(8, int(ch * scale))
    small = crop.resize((nw, nh), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.alpha_composite(small, ((W - nw) // 2, (H - nh) // 2))
    return out


def mul_alpha(im: Image.Image, mul: float) -> Image.Image:
    out = im.copy()
    a = out.split()[3].point(lambda p: int(p * clamp(mul, 0, 1)))
    out.putalpha(a)
    return out


def blend(a: Image.Image, b: Image.Image, t: float) -> Image.Image:
    t = clamp(t, 0, 1)
    if t <= 0:
        return a.copy()
    if t >= 1:
        return b.copy()
    return Image.blend(a, b, t)


def shift(im: Image.Image, ox: int, oy: int = 0) -> Image.Image:
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.alpha_composite(im, (ox, oy))
    return canvas


def trail_ghosts(im: Image.Image, amount: float) -> Image.Image:
    if amount < 0.1:
        return im
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for g, ga in ((0.55, 0.28), (0.35, 0.16), (0.2, 0.1)):
        canvas.alpha_composite(mul_alpha(im, ga * amount), (-int(48 * g), 0))
    canvas.alpha_composite(im)
    return canvas


def impact_burst(canvas: Image.Image, t: float) -> Image.Image:
    d = ImageDraw.Draw(canvas)
    cx, cy = int(W * 0.68), int(H * 0.48)
    for k in range(14):
        ang = k / 14 * math.tau + t
        dist = 18 + t * 48
        x = cx + math.cos(ang) * dist * (1.15 if math.cos(ang) > 0 else 0.55)
        y = cy + math.sin(ang) * dist * 0.8
        r = 2 + (k % 3)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(*RGB, int(170 * (1 - t * 0.4))))
    return canvas


def ease_in(t: float, power: float = 2.35) -> float:
    """Chậm đầu → nhanh dần (acceleration)."""
    return clamp(t, 0, 1) ** power


def key_at(keys: list[Image.Image], idx_f: float) -> Image.Image:
    """Lấy key nội suy theo chỉ số thực 0..7."""
    idx_f = clamp(idx_f, 0, len(keys) - 1.001)
    i0 = int(math.floor(idx_f))
    i1 = min(i0 + 1, len(keys) - 1)
    return blend(keys[i0], keys[i1], idx_f - i0)


def sample_keys(keys: list[Image.Image], frame_i: int) -> Image.Image:
    """
    01–06: tụ chậm (lùi).
    07–21: bay — ox + morph key tăng tốc (ease-in).
    22–24: impact/break nhanh.
    """
    f = frame_i
    if f <= 6:
        # charge chậm, không tăng tốc
        t = (f - 1) / 5.0
        u = smoothstep(t)
        base = key_at(keys, lerp(0.0, 0.85, u))
        ox = int(lerp(6, -50, u))
        oy = int(lerp(0, 5, u))
        return trail_ghosts(shift(base, ox, oy), 0.12 * u)

    if f <= 21:
        # travel: progress 0→1 với ease-in → nhanh dần
        t = (f - 7) / 14.0  # 15 frames: 7..21
        acc = ease_in(t, 2.4)
        # key: 1 → 6 (stream → contact), cũng tăng tốc
        base = key_at(keys, lerp(1.0, 6.0, acc))
        ox = int(lerp(-50, 62, acc))
        trail = lerp(0.35, 1.0, acc)
        fr = trail_ghosts(shift(base, ox, 0), trail)
        # cuối travel bắt đầu burst nhẹ
        if t > 0.75:
            fr = impact_burst(fr, (t - 0.75) / 0.25 * 0.55)
        return fr

    # 22–24 break — nhanh / gọn
    t = (f - 22) / 2.0
    u = smoothstep(t)
    base = key_at(keys, lerp(6.0, 7.0, u))
    fr = mul_alpha(shift(base, 64, 0), lerp(0.8, 0.3, u))
    fr = impact_burst(fr, 0.65 + 0.35 * u)
    if u > 0.25:
        fr = fr.filter(ImageFilter.GaussianBlur(radius=0.35 + u * 0.55))
    return fr


def preview_durations() -> list[int]:
    """ms/frame — tụ chậm, bay nhanh dần, impact gọn."""
    durs: list[int] = []
    for f in range(1, N + 1):
        if f <= 6:
            durs.append(95)  # tụ chậm
        elif f <= 21:
            t = (f - 7) / 14.0
            # 88ms → ~42ms (nhanh dần)
            durs.append(int(lerp(88, 40, ease_in(t, 2.0))))
        else:
            durs.append(48)
    return durs


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    src = SRC if SRC.exists() else SRC_FALLBACK
    if not src.exists():
        raise SystemExit(f"Missing soi GIF: {SRC}")
    if src != SRC:
        shutil.copy2(src, SRC)

    raw = composite_gif(SRC)
    if len(raw) < 8:
        raise SystemExit(f"Need ≥8 frames, got {len(raw)}")
    keys = []
    for fr in raw[:8]:
        k = fit_canvas(knockout_black(fr))
        k = ImageEnhance.Contrast(k).enhance(1.06)
        k = ImageEnhance.Color(k).enhance(1.08)
        keys.append(k)

    keys[0].save(DEST / "_ref_wolf.png")
    keys[0].save(DEST / "_ref_soi_cyan.png")

    flight = [sample_keys(keys, i) for i in range(1, N + 1)]
    key_dir = DEST / "qi_key"
    key_dir.mkdir(exist_ok=True)
    for old in DEST.glob("flight_*.png"):
        old.unlink()
    for old in key_dir.glob("flight_*.png"):
        old.unlink()
    ki = 1
    for i, fr in enumerate(flight, 1):
        fr.save(DEST / f"flight_{i:02d}.png", optimize=True)
        if i in KEY_IDX:
            fr.save(key_dir / f"flight_{ki:02d}.png", optimize=True)
            ki += 1

    durs = preview_durations()
    flight[0].save(
        DEST / "_preview_soi.gif",
        save_all=True,
        append_images=flight[1:],
        duration=durs,
        loop=0,
        disposal=2,
    )
    shutil.copy2(DEST / "_preview_soi.gif", DEST / "_preview_flight.gif")
    print(f"  preview durations ms: charge={durs[0]} → mid={durs[12]} → end={durs[-1]}")
    picks = [0, 7, 11, 15, 23]
    sheet = Image.new("RGBA", (W * len(picks), H), (0, 0, 0, 255))
    for i, idx in enumerate(picks):
        sheet.paste(flight[idx], (i * W, 0))
    sheet.save(DEST / "_preview_soi_contact.png")

    (DEST / "README.md").write_text(
        """# qi_wolf (soi)

Look từ `_ref_soi_user.gif` (cyan spirit). Flight = chiêu tụ→stream→tan.

Gen: `python3 scripts/gen-qi-soi-from-user-gif.py`
Preview: `_preview_soi.gif`
""",
        encoding="utf-8",
    )
    print("→ soi flight×24 from user GIF")
    print("done")


if __name__ == "__main__":
    main()
