#!/usr/bin/env python3
"""
Gen lôi đỏ (hoa_long) — strike dọc khí thế + impact + preview GIF.

Nguồn: key GenerateImage (crimson bolt / impact) + motion flicker 24f.
Không đụng qi_thunder vàng / bagua.

Usage:
  python3 scripts/gen-qi-crimson-thunder.py
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets/fx/skill/loi/qi_crimson"
KEY_STRIKE = Path(
    "/Users/it/.cursor/projects/Users-it-Documents-3Q/assets/qi_crimson_thunder_strike_key.jpg"
)
KEY_IMPACT = Path(
    "/Users/it/.cursor/projects/Users-it-Documents-3Q/assets/qi_crimson_thunder_impact_key.jpg"
)
REF_FIRE = ROOT / "assets/fx/skill/rong/qi_fire/_ref_dragon_fire.png"

# Portrait strike (dọc) — cân tướng ~1.28
SW, SH = 192, 480
# Impact vuông
IW, IH = 320, 320
N = 24
PI2 = math.tau


def clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


def black_to_alpha(im: Image.Image, thr: int = 18) -> Image.Image:
    """JPG đen nền → RGBA; giữ glow đỏ."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sp = rgb.load()
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = sp[x, y]
            lum = max(r, g, b)
            if lum < thr:
                continue
            # luma → alpha, đẩy đỏ hỏa long
            a = int(min(255, lum * 1.15))
            # hoa_long push: boost R, trim cyan
            nr = min(255, int(r * 1.08 + 12))
            ng = min(255, int(g * 0.92))
            nb = min(255, int(b * 0.55))
            op[x, y] = (nr, ng, nb, a)
    return out


def fit_canvas(im: Image.Image, tw: int, th: int, pad: float = 0.92) -> Image.Image:
    """Scale fit vào canvas trong suốt, giữ tỉ lệ."""
    canvas = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    iw, ih = im.size
    scale = min((tw * pad) / iw, (th * pad) / ih)
    nw, nh = max(8, int(iw * scale)), max(8, int(ih * scale))
    spr = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.alpha_composite(spr, ((tw - nw) // 2, (th - nh) // 2))
    return canvas


def mul_alpha(im: Image.Image, mul: float) -> Image.Image:
    out = im.copy()
    a = out.split()[3].point(lambda p: int(p * clamp(mul)))
    out.putalpha(a)
    return out


def warp_bolt(im: Image.Image, phase: float, amp: float = 4.5) -> Image.Image:
    """Rung ngang nhẹ — sét sống."""
    w, h = im.size
    px = im.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        t = y / max(1, h - 1)
        dx = int(amp * math.sin(phase * PI2 + t * 9.0) * (0.35 + 0.65 * t))
        for x in range(w):
            sx = x - dx
            if 0 <= sx < w:
                op[x, y] = px[sx, y]
    return out


def reveal_down(im: Image.Image, progress: float) -> Image.Image:
    """Sét đánh từ trên xuống: 0=ẩn, 1=full."""
    progress = clamp(progress)
    w, h = im.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    # frontier + soft falloff
    cut = int(h * progress)
    feather = max(8, int(h * 0.08))
    mask = Image.new("L", (w, h), 0)
    mp = mask.load()
    for y in range(h):
        if y <= cut:
            a = 255
        elif y < cut + feather:
            a = int(255 * (1.0 - (y - cut) / feather))
        else:
            a = 0
        for x in range(w):
            mp[x, y] = a
    out = Image.composite(im, out, mask)
    return out


def spark_spray(canvas: Image.Image, rng: random.Random, n: int, rgb=(255, 90, 20)) -> None:
    w, h = canvas.size
    px = canvas.load()
    for _ in range(n):
        x = rng.randint(0, w - 1)
        y = rng.randint(int(h * 0.35), h - 1)
        r0, g0, b0, a0 = px[x, y]
        if a0 < 20 and rng.random() > 0.35:
            continue
        rr = min(255, rgb[0] + rng.randint(-20, 40))
        gg = min(255, max(0, rgb[1] + rng.randint(-30, 20)))
        bb = min(255, max(0, rgb[2] + rng.randint(-10, 10)))
        aa = rng.randint(120, 255)
        px[x, y] = (rr, gg, bb, aa)
        if rng.random() > 0.5 and x + 1 < w:
            px[x + 1, y] = (rr, gg, bb, aa // 2)


def strike_frame(base: Image.Image, i: int, n: int = N) -> Image.Image:
    t = (i - 1) / max(1, n - 1)
    rng = random.Random(9000 + i)
    # 01–06 tụ/kéo xuống; 07–16 full khí thế; 17–24 tan
    if t < 0.22:
        prog = (t / 0.22) ** 0.7
        alpha = 0.55 + 0.45 * prog
        bright = 0.95 + 0.2 * prog
    elif t < 0.72:
        prog = 1.0
        pulse = 0.5 + 0.5 * math.sin((t - 0.22) / 0.5 * PI2 * 2.2)
        alpha = 0.92 + 0.08 * pulse
        bright = 1.05 + 0.22 * pulse
    else:
        fade = (t - 0.72) / 0.28
        prog = 1.0
        alpha = 1.0 - fade * 0.92
        bright = 1.15 - fade * 0.55

    fr = reveal_down(base, prog)
    fr = warp_bolt(fr, phase=t * 3.1 + i * 0.07, amp=3.2 + 2.8 * (1.0 if t < 0.72 else 0.4))
    fr = ImageEnhance.Brightness(fr).enhance(bright)
    fr = ImageEnhance.Contrast(fr).enhance(1.12)
    # bloom nhẹ
    glow = fr.filter(ImageFilter.GaussianBlur(radius=2.2))
    glow = mul_alpha(glow, 0.45)
    canvas = Image.new("RGBA", base.size, (0, 0, 0, 0))
    canvas.alpha_composite(glow)
    canvas.alpha_composite(fr)
    spark_spray(canvas, rng, n=28 if t < 0.75 else 10)
    return mul_alpha(canvas, alpha)


def impact_frame(base: Image.Image, i: int, n: int = N) -> Image.Image:
    t = (i - 1) / max(1, n - 1)
    rng = random.Random(12000 + i)
    # nở nhanh rồi tan
    if t < 0.35:
        s = 0.55 + 0.55 * (t / 0.35)
        a = 0.5 + 0.5 * (t / 0.35)
    elif t < 0.65:
        s = 1.1 + 0.08 * math.sin(t * 20)
        a = 1.0
    else:
        fade = (t - 0.65) / 0.35
        s = 1.12 + 0.25 * fade
        a = 1.0 - fade

    w, h = base.size
    nw, nh = max(8, int(w * s)), max(8, int(h * s))
    spr = base.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    canvas.alpha_composite(spr, ((w - nw) // 2, (h - nh) // 2))
    canvas = ImageEnhance.Brightness(canvas).enhance(1.08 + 0.15 * math.sin(t * PI2 * 3))
    spark_spray(canvas, rng, n=40 if t < 0.7 else 12)
    return mul_alpha(canvas, a)


def save_seq(frames: list[Image.Image], stem: str) -> None:
    for i, fr in enumerate(frames, 1):
        fr.save(DEST / f"{stem}_{i:02d}.png")


def preview_gif(frames: list[Image.Image], name: str, duration_ms: int = 70) -> None:
    if not frames:
        return
    frames[0].save(
        DEST / name,
        save_all=True,
        append_images=frames[1:],
        duration=duration_ms,
        loop=0,
        disposal=2,
    )


def contact_sheet(frames: list[Image.Image], picks: list[int], name: str) -> None:
    picks = [p for p in picks if 1 <= p <= len(frames)]
    if not picks:
        return
    w, h = frames[0].size
    sheet = Image.new("RGBA", (w * len(picks), h), (0, 0, 0, 255))
    for i, idx in enumerate(picks):
        sheet.paste(frames[idx - 1], (i * w, 0))
    sheet.save(DEST / name)


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    if not KEY_STRIKE.exists():
        raise SystemExit(f"missing strike key: {KEY_STRIKE}")
    if not KEY_IMPACT.exists():
        raise SystemExit(f"missing impact key: {KEY_IMPACT}")

    strike_raw = black_to_alpha(Image.open(KEY_STRIKE), thr=14)
    impact_raw = black_to_alpha(Image.open(KEY_IMPACT), thr=14)
    # đẩy tint hỏa long từ ref nếu có
    if REF_FIRE.exists():
        fire = Image.open(REF_FIRE).convert("RGBA")
        # lấy avg fire hue boost
        strike_raw = ImageEnhance.Color(strike_raw).enhance(1.15)
        impact_raw = ImageEnhance.Color(impact_raw).enhance(1.12)

    strike_base = fit_canvas(strike_raw, SW, SH, pad=0.96)
    impact_base = fit_canvas(impact_raw, IW, IH, pad=0.94)
    strike_base.save(DEST / "_ref_crimson_strike.png")
    impact_base.save(DEST / "_ref_crimson_impact.png")
    # copy source jpg refs for traceability
    Image.open(KEY_STRIKE).convert("RGB").save(DEST / "_ref_src_strike.jpg", quality=92)
    Image.open(KEY_IMPACT).convert("RGB").save(DEST / "_ref_src_impact.jpg", quality=92)

    strikes = [strike_frame(strike_base, i) for i in range(1, N + 1)]
    impacts = [impact_frame(impact_base, i) for i in range(1, N + 1)]
    # charge = strike early frames (tụ)
    charges = [mul_alpha(strikes[min(i, 5)], 0.75 + 0.04 * i) for i in range(N)]

    save_seq(strikes, "strike")
    save_seq(impacts, "impact")
    save_seq(charges, "charge")
    # flight alias = strike (để qiSeq không trống nếu ai gọi)
    save_seq(strikes, "flight")

    preview_gif(strikes, "_preview_loi_do.gif", duration_ms=55)
    contact_sheet(strikes, [1, 6, 12, 18, 24], "_preview_loi_do_contact.png")

    (DEST / "README.md").write_text(
        """# qi_crimson — Lôi đỏ (hoa_long)

Sét dọc khí thế màu hỏa long — dùng khi hồn đánh địch.

Preview: `_preview_loi_do.gif`
""",
        encoding="utf-8",
    )
    print(f"ok → {DEST}  strike/impact/charge×{N}  preview _preview_loi_do.gif")


if __name__ == "__main__":
    main()
