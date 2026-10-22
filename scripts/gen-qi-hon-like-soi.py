#!/usr/bin/env python3
"""
Gen flight/GIF hồn thú GIỐNG sói: full body → stream lao → tan.

Không đụng: bagua, soi (đã có gen-qi-soi-from-user-gif.py).

Usage:
  python3 scripts/gen-qi-hon-like-soi.py
  python3 scripts/gen-qi-hon-like-soi.py ho loi phong
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
FX = ROOT / "assets/fx"

W, H, N = 384, 192, 24
KEY_IDX = (1, 8, 16, 24)
PI2 = math.tau

# tag → (rel, ref_file, rgb accent)
PACKS = {
    "ho": ("skill/ho/qi_tiger", "_ref_tiger.png", (255, 150, 40)),
    "loi": ("skill/loi/qi_thunder", "_ref_thunder.png", (255, 230, 90)),
    # hon: art nhân hình vung tay từ main — KHÔNG gen like-soi
    "phong": ("skill/phong/qi_wind", "_ref_wind.png", (100, 255, 220)),
    "xa": ("skill/xa/qi_poison", "_ref_poison.png", (80, 255, 120)),
    "thuy": ("skill/thuy/qi_water", "_ref_water.png", (60, 180, 255)),
    "rong": ("skill/rong/qi_fire", "_ref_dragon_fire.png", (255, 140, 40)),
}


def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def smoothstep(t: float) -> float:
    t = clamp(t, 0, 1)
    return t * t * (3 - 2 * t)


def ease_in(t: float, power: float = 2.35) -> float:
    return clamp(t, 0, 1) ** power


def mul_alpha(im: Image.Image, mul: float) -> Image.Image:
    out = im.copy()
    a = out.split()[3].point(lambda p: int(p * clamp(mul, 0, 1)))
    out.putalpha(a)
    return out


def content_bbox(im: Image.Image, thr: int = 18):
    return im.split()[3].getbbox() or (0, 0, im.size[0], im.size[1])


def paste_center(canvas: Image.Image, spr: Image.Image, ox: int = 0, oy: int = 0) -> None:
    x = (canvas.size[0] - spr.size[0]) // 2 + ox
    y = (canvas.size[1] - spr.size[1]) // 2 + oy
    canvas.alpha_composite(spr, (x, y))


def scale_xy(im: Image.Image, sx: float, sy: float) -> Image.Image:
    w, h = im.size
    nw, nh = max(8, int(w * sx)), max(8, int(h * sy))
    return im.resize((nw, nh), Image.Resampling.LANCZOS)


def prep_base(raw: Image.Image) -> Image.Image:
    """Thu ~72% để còn lề ox."""
    if raw.size != (W, H):
        raw = raw.resize((W, H), Image.Resampling.LANCZOS)
    body = scale_xy(raw, 0.72, 0.72)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    paste_center(canvas, body)
    return ImageEnhance.Contrast(canvas).enhance(1.05)


def make_stream_form(base: Image.Image, amount: float, rgb: tuple[int, int, int]) -> Image.Image:
    """
    Giống frame mid sói: giữ đầu (phải), thân/chân → dải stream trái.
    amount 0=full body, 1=head+trail tối đa.
    """
    amount = clamp(amount, 0, 1)
    if amount < 0.05:
        return base.copy()

    w, h = base.size
    bbox = content_bbox(base)
    x0, y0, x1, y1 = bbox
    span = max(1, x1 - x0)
    # head zone: right ~38% of content
    head_cut = int(x0 + span * (0.55 - 0.08 * amount))

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    # 1) head/front — keep sharp, slight stretch
    head = base.crop((head_cut, 0, w, h))
    head_s = scale_xy(head, 1.0 + 0.12 * amount, 1.0 - 0.08 * amount)
    hx = head_cut + (w - head_cut - head_s.size[0]) // 2 + int(8 * amount)
    hy = (h - head_s.size[1]) // 2
    out.alpha_composite(head_s, (max(0, hx), max(0, hy)))

    # 2) body → smear trail to the left
    body = base.copy()
    a = body.split()[3]
    px = a.load()
    for x in range(w):
        # fade right (head kept separately); keep left for trail source
        s = clamp((x - x0) / span, 0, 1)
        if s > 0.5:
            fade = 1.0 - amount * ((s - 0.5) / 0.5)
            for y in range(h):
                px[x, y] = int(px[x, y] * max(0, fade))
        # fade legs (bottom)
        for y in range(int(h * 0.55), h):
            t = (y - h * 0.55) / (h * 0.45)
            px[x, y] = int(px[x, y] * (1.0 - amount * 0.75 * t))
    body.putalpha(a)

    # horizontal smear copies
    trail = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for k, ga in (
        (0, 0.55 * (1 - amount * 0.3)),
        (14, 0.4 * amount),
        (28, 0.28 * amount),
        (44, 0.18 * amount),
        (62, 0.1 * amount),
        (82, 0.06 * amount),
    ):
        g = mul_alpha(body, ga)
        # stretch horizontally for speed
        if amount > 0.3 and k > 0:
            nw = max(8, int(g.size[0] * (1.0 + 0.15 * amount)))
            g = g.resize((nw, g.size[1]), Image.Resampling.BILINEAR)
        trail.alpha_composite(g, (-k - int(20 * amount), 0))
    out = Image.alpha_composite(trail, out)

    # particles behind
    if amount > 0.25:
        d = ImageDraw.Draw(out)
        n = int(8 + amount * 16)
        for i in range(n):
            back = i / n
            x = head_cut - 30 - back * 100 - (i * 7) % 18
            y = h * 0.35 + math.sin(i * 1.1) * h * 0.22
            r = 1 + (i % 3)
            aa = int(140 * amount * (1 - back * 0.7))
            d.ellipse([x - r, y - r, x + r, y + r], fill=(*rgb, aa))

    return out.filter(ImageFilter.GaussianBlur(radius=0.25 * amount))


def make_impact(base: Image.Image, t: float, rgb: tuple[int, int, int]) -> Image.Image:
    stream = make_stream_form(base, 0.85 + 0.1 * t, rgb)
    stream = mul_alpha(stream, lerp(1.0, 0.55, t))
    d = ImageDraw.Draw(stream)
    cx, cy = int(W * 0.7), int(H * 0.48)
    for k in range(16):
        ang = k / 16 * PI2 + t
        dist = 22 + t * 50
        x = cx + math.cos(ang) * dist * (1.2 if math.cos(ang) > 0 else 0.5)
        y = cy + math.sin(ang) * dist * 0.85
        r = 2 + (k % 3)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(*rgb, int(180 * (1 - t * 0.35))))
    return stream


def make_break(base: Image.Image, t: float, rgb: tuple[int, int, int]) -> Image.Image:
    # residual swoosh — smear only
    stream = make_stream_form(base, 1.0, rgb)
    stream = mul_alpha(stream, lerp(0.45, 0.12, t))
    # shift mass left as dissolve
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.alpha_composite(stream, (-int(20 * t), 0))
    d = ImageDraw.Draw(canvas)
    for k in range(12):
        x = W * 0.55 - k * 8 - t * 30
        y = H * 0.4 + math.sin(k) * 30
        d.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(*rgb, int(100 * (1 - t))))
    return canvas.filter(ImageFilter.GaussianBlur(radius=0.5 + t))


def build_keys(base: Image.Image, rgb: tuple[int, int, int]) -> list[Image.Image]:
    """8 key giống cấu trúc GIF sói."""
    k0 = base.copy()
    k1 = make_stream_form(base, 0.15, rgb)
    k1 = scale_xy(k1, 0.94, 1.06)  # squat hint
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    paste_center(canvas, k1, ox=-8, oy=4)
    k1 = canvas
    k2 = make_stream_form(base, 0.45, rgb)
    k3 = make_stream_form(base, 0.7, rgb)
    k4 = make_stream_form(base, 0.88, rgb)
    k5 = make_stream_form(base, 0.95, rgb)
    k6 = make_impact(base, 0.35, rgb)
    k7 = make_break(base, 0.55, rgb)
    return [k0, k1, k2, k3, k4, k5, k6, k7]


def blend(a: Image.Image, b: Image.Image, t: float) -> Image.Image:
    t = clamp(t, 0, 1)
    if t <= 0:
        return a.copy()
    if t >= 1:
        return b.copy()
    return Image.blend(a.convert("RGBA"), b.convert("RGBA"), t)


def key_at(keys: list[Image.Image], idx_f: float) -> Image.Image:
    idx_f = clamp(idx_f, 0, len(keys) - 1.001)
    i0 = int(math.floor(idx_f))
    i1 = min(i0 + 1, len(keys) - 1)
    return blend(keys[i0], keys[i1], idx_f - i0)


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


def sample_flight(keys: list[Image.Image], frame_i: int, rgb: tuple[int, int, int]) -> Image.Image:
    """Cùng timeline sói: tụ chậm → bay tăng tốc → tan."""
    f = frame_i
    if f <= 6:
        t = (f - 1) / 5.0
        u = smoothstep(t)
        base = key_at(keys, lerp(0.0, 0.9, u))
        ox = int(lerp(6, -50, u))
        return trail_ghosts(shift(base, ox, int(4 * u)), 0.12 * u)

    if f <= 21:
        t = (f - 7) / 14.0
        acc = ease_in(t, 2.4)
        base = key_at(keys, lerp(1.0, 6.0, acc))
        ox = int(lerp(-50, 62, acc))
        fr = trail_ghosts(shift(base, ox, 0), lerp(0.35, 1.0, acc))
        if t > 0.75:
            # light burst overlay
            d = ImageDraw.Draw(fr)
            cx, cy = int(W * 0.7), int(H * 0.48)
            u = (t - 0.75) / 0.25
            for k in range(10):
                ang = k / 10 * PI2
                dist = 16 + u * 36
                x = cx + math.cos(ang) * dist
                y = cy + math.sin(ang) * dist * 0.8
                d.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(*rgb, int(120 * u)))
        return fr

    t = (f - 22) / 2.0
    u = smoothstep(t)
    base = key_at(keys, lerp(6.0, 7.0, u))
    fr = mul_alpha(shift(base, 64, 0), lerp(0.8, 0.28, u))
    if u > 0.25:
        fr = fr.filter(ImageFilter.GaussianBlur(radius=0.4 + u * 0.5))
    return fr


def save_flight(dest: Path, flight: list[Image.Image], tag: str) -> None:
    key_dir = dest / "qi_key"
    key_dir.mkdir(parents=True, exist_ok=True)
    for old in dest.glob("flight_*.png"):
        old.unlink()
    for old in key_dir.glob("flight_*.png"):
        old.unlink()
    ki = 1
    for i, fr in enumerate(flight, 1):
        fr.save(dest / f"flight_{i:02d}.png", optimize=True)
        if i in KEY_IDX:
            fr.save(key_dir / f"flight_{ki:02d}.png", optimize=True)
            ki += 1

    # preview — duration tăng tốc nhẹ (chỉ preview; path combat đã ease-in riêng)
    durs = []
    for f in range(1, N + 1):
        if f <= 6:
            durs.append(90)
        elif f <= 21:
            durs.append(int(lerp(80, 42, ease_in((f - 7) / 14.0, 2.0))))
        else:
            durs.append(48)
    gif = dest / f"_preview_{tag}.gif"
    flight[0].save(
        gif,
        save_all=True,
        append_images=flight[1:],
        duration=durs,
        loop=0,
        disposal=2,
    )
    picks = [0, 7, 11, 15, 23]
    sheet = Image.new("RGBA", (W * len(picks), H), (0, 0, 0, 255))
    for i, idx in enumerate(picks):
        sheet.paste(flight[idx], (i * W, 0))
    sheet.save(dest / f"_preview_{tag}_contact.png")
    print(f"    → {gif.name}")


def gen_pack(tag: str) -> bool:
    if tag not in PACKS:
        print(f"SKIP unknown {tag}")
        return False
    rel, ref_name, rgb = PACKS[tag]
    dest = FX / rel
    ref_path = dest / ref_name
    if not ref_path.exists():
        # fallback _ref_dragon.png for rong
        alt = dest / "_ref_dragon.png"
        if alt.exists():
            ref_path = alt
        else:
            print(f"FAIL {tag}: thiếu {ref_name}")
            return False
    print(f"→ {tag}  ({rel}) like-soi")
    raw = Image.open(ref_path).convert("RGBA")
    base = prep_base(raw)
    keys = build_keys(base, rgb)
    # stash keys for debug
    for i, k in enumerate(keys):
        k.save(dest / f"_key_soi_style_{i:02d}.png")
    flight = [sample_flight(keys, i, rgb) for i in range(1, N + 1)]
    save_flight(dest, flight, tag)
    (dest / "README.md").write_text(
        f"""# qi {tag}

Flight/GIF kiểu sói: tụ → stream lao → tan. Art từ `{ref_name}`.

Gen: `python3 scripts/gen-qi-hon-like-soi.py {tag}`
Preview: `_preview_{tag}.gif`
""",
        encoding="utf-8",
    )
    return True


def main() -> None:
    wanted = [a for a in sys.argv[1:] if a in PACKS]
    if not wanted:
        # mặc định: hồn thú còn lại (không bagua/soi; rong giữ serpentine riêng)
        wanted = ["ho", "loi", "phong", "xa", "thuy"]
    ok_n = 0
    for tag in wanted:
        if gen_pack(tag):
            ok_n += 1
    print(f"done {ok_n}/{len(wanted)}")


if __name__ == "__main__":
    main()
