#!/usr/bin/env python3
"""
Sửa MOTION hồn thú — giữ art (_ref_*), đổi chuyển động thành nhịp chiêu.

Scope: ho / soi / loi / hon / phong
KHÔNG đụng: bagua, xa, thuy, rồng

Timeline 24f:
  01–06 charge/anticipation (co, lùi trái)
  07–18 travel/release (lao ngang phải + stretch + trail)
  19–24 impact/break (chạm phải, vỡ khí)

Usage:
  python3 scripts/gen-qi-skill-motion.py              # cả 5
  python3 scripts/gen-qi-skill-motion.py ho soi       # chọn pack
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
FX = ROOT / "assets/fx"

W, H = 384, 192
N = 24
PI2 = math.tau
KEY_IDX = (1, 8, 16, 24)

# tag → (rel, ref_glob, rgb accent, feel: heavy|fast|ethereal|thunder|wind)
PACKS = {
    "ho": ("skill/ho/qi_tiger", "_ref_tiger.png", (255, 150, 40), "heavy"),
    "soi": ("skill/soi/qi_wolf", "_ref_wolf.png", (180, 220, 255), "soi"),
    "loi": ("skill/loi/qi_thunder", "_ref_thunder.png", (255, 230, 90), "thunder"),
    "hon": ("skill/hon/qi_soul", "_ref_soul.png", (200, 160, 255), "ethereal"),
    "phong": ("skill/phong/qi_wind", "_ref_wind.png", (100, 255, 220), "wind"),
}


def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def smoothstep(t: float) -> float:
    t = clamp(t, 0, 1)
    return t * t * (3 - 2 * t)


def content_bbox(im: Image.Image, thr: int = 18) -> tuple[int, int, int, int]:
    return im.split()[3].getbbox() or (0, 0, im.size[0], im.size[1])


def paste_center(canvas: Image.Image, spr: Image.Image, ox: int = 0, oy: int = 0) -> None:
    x = (canvas.size[0] - spr.size[0]) // 2 + ox
    y = (canvas.size[1] - spr.size[1]) // 2 + oy
    canvas.alpha_composite(spr, (x, y))


def scale_xy(im: Image.Image, sx: float, sy: float) -> Image.Image:
    w, h = im.size
    nw = max(8, int(w * sx))
    nh = max(8, int(h * sy))
    return im.resize((nw, nh), Image.Resampling.LANCZOS)


def mul_alpha(im: Image.Image, mul: float) -> Image.Image:
    out = im.copy()
    a = out.split()[3].point(lambda p: int(p * clamp(mul, 0, 1)))
    out.putalpha(a)
    return out


def shear_x(im: Image.Image, amount: float) -> Image.Image:
    """Shear ngang nhẹ — đuôi/trái trễ (amount >0: trái kéo thêm về sau)."""
    if abs(amount) < 0.01:
        return im
    w, h = im.size
    # PIL AFFINE: x' = a*x + b*y + c
    # shear: x' = x + amount*(0.5 - y/h)  — mild vertical-dependent OR rear lag by column
    # Better: rear (left) lag via column remap
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sp = im.load()
    op = out.load()
    bbox = content_bbox(im)
    x0, x1 = bbox[0], bbox[2]
    span = max(1, x1 - x0)
    for x in range(w):
        s = clamp((x - x0) / span, 0, 1)  # 0=left/tail 1=right/head
        # tail lags more to the left when amount>0
        lag = int(amount * (1.0 - s) * (1.0 - s))
        src_x = x + lag
        if 0 <= src_x < w:
            for y in range(h):
                op[x, y] = sp[src_x, y]
    return out


def stream_legs(im: Image.Image, amount: float) -> Image.Image:
    """
    Travel: làm mờ/kéo chân (nửa dưới) thành dải khí — hết đọc run cycle.
    amount 0..1; giữ đầu/ngực (nửa trên) rõ.
    """
    if amount < 0.05:
        return im
    w, h = im.size
    out = im.copy()
    a = out.split()[3]
    # fade bottom 42% by column + mild horizontal smear
    px = a.load()
    y0 = int(h * 0.52)
    for y in range(y0, h):
        t = (y - y0) / max(1, h - y0)
        mul = 1.0 - amount * (0.35 + 0.55 * t)
        for x in range(w):
            px[x, y] = int(px[x, y] * mul)
    out.putalpha(a)
    # smear lower half leftward (stream)
    if amount > 0.2:
        lower = out.crop((0, y0, w, h))
        smear = Image.new("RGBA", (w, h - y0), (0, 0, 0, 0))
        for k, ga in ((0, 1.0), (8, 0.45 * amount), (16, 0.25 * amount), (28, 0.12 * amount)):
            g = mul_alpha(lower, ga)
            smear.alpha_composite(g, (-k, 0))
        out.paste(smear, (0, y0))
    return out


def phase_params_soi(frame_i: int) -> dict:
    """
    Sói khí — timeline đúng brief:
    01–04 tụ thấp lùi | 05–06 ant | 07–12 phóng stretch | 13–18 travel | 19–21 contact | 22–24 break
    """
    f = frame_i
    ant_back, travel_x = -52, 58
    if f <= 4:
        t = (f - 1) / 3.0
        u = smoothstep(t)
        return {
            "ox": int(lerp(6, ant_back * 0.7, u)),
            "oy": int(lerp(0, 8, u)),  # hạ thấp 1 lần
            "sx": lerp(1.0, 0.9, u),
            "sy": lerp(1.0, 1.12, u),
            "alpha": 1.0,
            "trail": 0.08 * u,
            "impact": 0.0,
            "phase": "charge",
            "shear": int(4 + 6 * u),
            "leg_stream": 0.0,
        }
    if f <= 6:
        t = (f - 5) / 1.0
        u = smoothstep(t)
        return {
            "ox": int(lerp(ant_back * 0.7, ant_back, u)),
            "oy": 8,
            "sx": lerp(0.9, 0.82, u),
            "sy": lerp(1.12, 1.16, u),
            "alpha": 1.0,
            "trail": 0.12,
            "impact": 0.0,
            "phase": "charge",
            "shear": int(10 + 4 * u),
            "leg_stream": 0.1 * u,
        }
    if f <= 12:
        # phóng — thân kéo dài, chân stream
        t = (f - 7) / 5.0
        u = smoothstep(t)
        return {
            "ox": int(lerp(ant_back, travel_x * 0.45, u)),
            "oy": int(lerp(8, 2, u)),
            "sx": lerp(0.88, 1.38, u),
            "sy": lerp(1.12, 0.82, u),
            "alpha": 1.0,
            "trail": lerp(0.35, 0.95, u),
            "impact": 0.0,
            "phase": "travel",
            "shear": int(14 + 12 * u),
            "leg_stream": lerp(0.35, 0.85, u),
        }
    if f <= 18:
        t = (f - 13) / 5.0
        u = smoothstep(t)
        return {
            "ox": int(lerp(travel_x * 0.45, travel_x, u)),
            "oy": 1,  # gần 0 — cấm bobbing
            "sx": lerp(1.32, 1.22, u),
            "sy": 0.86,
            "alpha": 1.0,
            "trail": lerp(0.95, 0.7, u),
            "impact": 0.0,
            "phase": "travel",
            "shear": int(22 - 4 * u),
            "leg_stream": 0.75,
        }
    if f <= 21:
        t = (f - 19) / 2.0
        u = smoothstep(t)
        return {
            "ox": int(lerp(travel_x, travel_x + 8, u)),
            "oy": 0,
            "sx": lerp(1.2, 1.08, u),
            "sy": lerp(0.88, 0.96, u),
            "alpha": lerp(1.0, 0.85, u),
            "trail": 0.45,
            "impact": lerp(0.4, 0.85, u),
            "phase": "impact",
            "shear": 10,
            "leg_stream": 0.4,
        }
    # 22–24 break
    t = (f - 22) / 2.0
    u = smoothstep(t)
    return {
        "ox": travel_x + 10,
        "oy": 0,
        "sx": lerp(1.05, 1.0, u),
        "sy": 1.0,
        "alpha": lerp(0.7, 0.28, u),
        "trail": lerp(0.5, 0.15, u),
        "impact": lerp(0.85, 1.0, u),
        "phase": "impact",
        "shear": int(8 - 4 * u),
        "leg_stream": 0.25,
    }


def phase_params(frame_i: int, feel: str) -> dict:
    """Trả params pose theo frame 1..24 — ox lớn để mắt đọc được xông ngang."""
    if feel == "soi":
        return phase_params_soi(frame_i)
    f = frame_i
    # ox trong ±70 (sau prep_base 70%) — đủ đọc xông, không cắt đầu
    if feel == "fast":
        ant_end, travel_end = 5, 18
        stretch_peak, ant_back, travel_x = 1.28, -56, 64
    elif feel == "ethereal":
        ant_end, travel_end = 6, 18
        stretch_peak, ant_back, travel_x = 1.22, -48, 60
    elif feel == "thunder":
        ant_end, travel_end = 6, 18
        stretch_peak, ant_back, travel_x = 1.26, -52, 64
    elif feel == "wind":
        ant_end, travel_end = 6, 18
        stretch_peak, ant_back, travel_x = 1.32, -52, 66
    else:  # heavy tiger
        ant_end, travel_end = 6, 18
        stretch_peak, ant_back, travel_x = 1.26, -58, 62

    if f <= ant_end:
        t = (f - 1) / max(1, ant_end - 1)
        u = smoothstep(t)
        # tụ → co lùi trái rõ
        coil = smoothstep(max(0, (t - 0.35) / 0.65))
        ox = int(lerp(8, ant_back, u * 0.55 + coil * 0.45))
        sx = lerp(1.0, 0.84, coil)
        sy = lerp(1.0, 1.1, coil)  # squat
        oy = int(lerp(0, 6, coil))  # hạ trọng tâm 1 lần — không loop
        alpha = lerp(0.5, 1.0, u) if feel == "ethereal" else 1.0
        trail = 0.05 * coil
        impact = 0.0
        phase = "charge"
        shear = 3 + int(6 * coil)
    elif f <= travel_end:
        t = (f - ant_end - 1) / max(1, travel_end - ant_end - 1)
        u = smoothstep(t)
        peak = math.sin(u * math.pi)
        # launch 3 frame đầu travel
        if f <= ant_end + 3:
            launch = smoothstep((f - ant_end) / 3.0)
            ox = int(lerp(ant_back, travel_x * 0.25, launch))
            sx = lerp(0.86, stretch_peak * 0.98, launch)
            sy = lerp(1.08, 0.9, launch)
            trail = lerp(0.2, 0.75, launch)
            shear = int(lerp(8, 18, launch))
        else:
            ox = int(lerp(travel_x * 0.25, travel_x, u))
            sx = lerp(1.05, stretch_peak, 0.4 + 0.6 * peak)
            sy = lerp(0.96, 0.88, peak)
            trail = lerp(0.55, 1.0, peak)
            shear = int(12 + 10 * peak)
        oy = int(1.5 * math.sin(u * math.pi))  # follow-through tối thiểu
        alpha = 1.0
        impact = 0.0
        phase = "travel"
    else:
        t = (f - travel_end - 1) / max(1, N - travel_end - 1)
        u = smoothstep(t)
        ox = int(lerp(travel_x, travel_x + 10, u))
        sx = lerp(stretch_peak * 0.95, 1.05, u)
        sy = lerp(0.9, 1.0, u)
        oy = 0
        alpha = lerp(1.0, 0.42, u)  # vẫn đọc được lúc tan
        trail = lerp(0.7, 0.2, u)
        impact = lerp(0.35, 1.0, u)
        phase = "impact"
        shear = int(lerp(10, 3, u))

    return {
        "ox": ox,
        "oy": oy,
        "sx": sx,
        "sy": sy,
        "alpha": alpha,
        "trail": trail,
        "impact": impact,
        "phase": phase,
        "shear": shear,
        "leg_stream": 0.55 if phase == "travel" and feel == "fast" else 0.0,
    }


def draw_particles(
    canvas: Image.Image,
    rgb: tuple[int, int, int],
    frame_i: int,
    p: dict,
    feel: str,
) -> None:
    d = ImageDraw.Draw(canvas)
    w, h = canvas.size
    cx = w * 0.55 + p["ox"] * 0.3
    cy = h * 0.5 + p["oy"]
    rng = (frame_i * 17 + 3) % 97

    if p["phase"] == "charge":
        n = 6 if feel != "thunder" else 10
        for k in range(n):
            ang = k / n * PI2 + frame_i * 0.2
            rr = 18 + (k % 3) * 6
            x = cx - 30 + math.cos(ang) * rr
            y = cy + math.sin(ang) * rr * 0.5
            a = int(90 * (frame_i / 6))
            r = 2 if feel in ("fast", "soi") else 3
            d.ellipse([x - r, y - r, x + r, y + r], fill=(*rgb, a))
        if feel == "thunder":
            for k in range(4):
                x0 = cx - 40 + (k * 11 + rng) % 30
                y0 = cy - 20 + (k * 13) % 40
                d.line([(x0, y0), (x0 + 8, y0 - 6)], fill=(*rgb, 100), width=1)

    if p["phase"] == "travel" and p["trail"] > 0.2:
        n = int(10 + p["trail"] * 12)
        for k in range(n):
            # mostly behind (left)
            back = (k / n)
            x = cx - 40 - back * 90 - ((rng + k * 7) % 20)
            y = cy + math.sin(k * 0.9 + frame_i * 0.35) * 28 * (0.3 + back)
            a = int(140 * p["trail"] * (1 - back * 0.7))
            r = 1 if feel in ("fast", "soi", "wind") else 2
            if feel == "heavy":
                r = 2 + (k % 2)
            d.ellipse([x - r, y - r, x + r, y + r], fill=(*rgb, a))

    if p["phase"] == "impact" and p["impact"] > 0.2:
        for k in range(16):
            ang = k / 16 * PI2 + frame_i * 0.15
            dist = 20 + p["impact"] * 55 + (k % 4) * 4
            # bias forward-right
            x = cx + 30 + math.cos(ang) * dist * (1.1 if math.cos(ang) > 0 else 0.6)
            y = cy + math.sin(ang) * dist * 0.85
            a = int(180 * (1 - p["impact"] * 0.5))
            r = 2 + (k % 3)
            d.ellipse([x - r, y - r, x + r, y + r], fill=(*rgb, a))
        # contact flash
        flash_a = int(90 * (1 - p["impact"]))
        if flash_a > 10:
            d.ellipse([cx + 20, cy - 28, cx + 70, cy + 28], fill=(*rgb, flash_a))


def prep_base(base: Image.Image) -> Image.Image:
    """Thu nhỏ ~70% để còn lề xông ±ox mà không cắt đầu."""
    body = scale_xy(base, 0.70, 0.70)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    paste_center(canvas, body)
    return canvas


def render_skill_frame(base: Image.Image, frame_i: int, rgb: tuple[int, int, int], feel: str) -> Image.Image:
    p = phase_params(frame_i, feel)
    # clamp ox — giữ ~90% alpha mass trong frame
    ox = int(clamp(p["ox"], -72, 72))
    body = scale_xy(base, p["sx"], p["sy"])
    body = shear_x(body, p["shear"] * (1.2 if p["phase"] == "travel" else 0.7))
    # sói: chân → stream khí (hết đọc gallop)
    ls = float(p.get("leg_stream") or 0)
    if ls > 0:
        body = stream_legs(body, ls)
    body = mul_alpha(body, p["alpha"])

    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    # motion trail ghosts — lệch trái rõ (streak bay)
    if p["trail"] > 0.12 and p["phase"] in ("travel", "impact", "charge"):
        for g, ga in ((0.7, 0.34), (0.45, 0.2), (0.25, 0.12)):
            ghost = mul_alpha(body, ga * max(0.4, p["trail"]))
            paste_center(canvas, ghost, ox=ox - int(55 * g), oy=p["oy"])

    paste_center(canvas, body, ox=ox, oy=p["oy"])
    draw_particles(canvas, rgb, frame_i, {**p, "ox": ox}, feel)

    # wind: chỉ 1 nhịp xòe lúc release — không flap loop
    if feel == "wind" and 7 <= frame_i <= 9:
        tip = mul_alpha(scale_xy(base, 1.25, 0.8), 0.2)
        paste_center(canvas, tip, ox=ox - 22, oy=p["oy"] - 3)

    if p["phase"] == "impact":
        canvas = canvas.filter(ImageFilter.GaussianBlur(radius=0.3 + p["impact"] * 0.35))
    return canvas


def render_charge_stem(base: Image.Image, frame_i: int, rgb: tuple[int, int, int], feel: str) -> Image.Image:
    """Charge stem: map 1–24 vào pha tụ + scale-in (vẫn anticipation, không run)."""
    t = (frame_i - 1) / (N - 1)
    # reuse frames 1–6 logic stretched across 24, then hold ready
    if t < 0.55:
        fi = 1 + int(t / 0.55 * 5)  # 1..6
    else:
        fi = 6
    fr = render_skill_frame(base, fi, rgb, feel)
    # scale in from small
    sc = lerp(0.4, 1.0, smoothstep(min(1.0, t / 0.7)))
    small = scale_xy(fr, sc, sc)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    paste_center(canvas, small, ox=int(-20 * (1 - sc)), oy=0)
    if t < 0.3:
        canvas = mul_alpha(canvas, t / 0.3)
    return canvas


def render_impact_stem(
    base: Image.Image, frame_i: int, rgb: tuple[int, int, int], feel: str, *, strike: bool
) -> Image.Image:
    t = (frame_i - 1) / (N - 1)
    if t < 0.25:
        fi = 16 + int(t / 0.25 * 2)
    else:
        fi = 19 + int(min(5, (t - 0.25) / 0.75 * 5))
    fi = clamp(fi, 1, 24)
    fr = render_skill_frame(base, int(fi), rgb, feel)
    if strike and t > 0.3:
        d = ImageDraw.Draw(fr)
        for yy in range(24, H - 24, 5):
            d.ellipse([W * 0.62 - 3, yy - 2, W * 0.62 + 3, yy + 2], fill=(*rgb, int(100 * (1 - t))))
    return fr


def save_stem(dest: Path, stem: str, frames: list[Image.Image]) -> None:
    key = dest / "qi_key"
    key.mkdir(parents=True, exist_ok=True)
    for old in dest.glob(f"{stem}_*.png"):
        old.unlink()
    for old in key.glob(f"{stem}_*.png"):
        old.unlink()
    ki = 1
    for i, fr in enumerate(frames, start=1):
        fr.save(dest / f"{stem}_{i:02d}.png", optimize=True)
        if i in KEY_IDX:
            fr.save(key / f"{stem}_{ki:02d}.png", optimize=True)
            ki += 1


def write_preview(dest: Path, flight: list[Image.Image], tag: str) -> None:
    for old in dest.glob("_preview_*"):
        # keep only our tag pattern after write
        pass
    gif = dest / f"_preview_{tag}.gif"
    contact = dest / f"_preview_{tag}_contact.png"
    # remove legacy names
    for name in ("_preview_flight.gif", "_preview_flight_contact.png"):
        p = dest / name
        if p.exists():
            p.unlink()
    flight[0].save(
        gif,
        save_all=True,
        append_images=flight[1:],
        duration=int(1000 / 13),
        loop=0,
        disposal=2,
    )
    picks = [0, 7, 11, 15, 23]
    sheet = Image.new("RGBA", (W * len(picks), H), (0, 0, 0, 255))
    for i, idx in enumerate(picks):
        sheet.paste(flight[idx], (i * W, 0))
    sheet.save(contact)
    print(f"    → {gif.name}")


def qa_horizontal(flight: list[Image.Image]) -> tuple[bool, str]:
    """QA: centroid X tăng theo pha travel; Y variance thấp."""
    def centroid(im: Image.Image) -> tuple[float, float]:
        a = im.split()[3]
        px = a.load()
        w, h = im.size
        sx = sy = sw = 0.0
        for x in range(0, w, 2):
            for y in range(0, h, 2):
                v = px[x, y]
                if v > 30:
                    sx += x * v
                    sy += y * v
                    sw += v
        if sw < 1:
            return w * 0.5, h * 0.5
        return sx / sw, sy / sw

    c1 = centroid(flight[0])
    c6 = centroid(flight[5])   # deep anticipation (trái)
    c8 = centroid(flight[7])   # launch
    c16 = centroid(flight[15]) # mid travel
    c24 = centroid(flight[23])
    # xông = từ co trái → lao phải
    dx = c16[0] - c6[0]
    ys = [centroid(flight[i])[1] for i in (0, 5, 11, 17, 23)]
    y_span = max(ys) - min(ys)
    ok_x = dx >= 40
    ok_y = y_span <= 24
    ok_surge = c16[0] > c6[0] + 30 and c16[0] > c1[0] + 10
    ok = ok_x and ok_y and ok_surge
    reason = (
        f"dx6→16={dx:.1f} y_span={y_span:.1f} "
        f"c=({c1[0]:.0f}|{c6[0]:.0f}→{c8[0]:.0f}→{c16[0]:.0f}→{c24[0]:.0f})"
    )
    return ok, reason


def gen_pack(tag: str, *, flight_only: bool = False) -> bool:
    rel, ref_name, rgb, feel = PACKS[tag]
    dest = FX / rel
    ref_path = dest / ref_name
    if not ref_path.exists():
        print(f"FAIL {tag}: thiếu {ref_path}")
        return False
    print(f"→ {tag}  ({rel}) feel={feel}" + (" [flight only]" if flight_only else ""))
    raw = Image.open(ref_path).convert("RGBA")
    if raw.size != (W, H):
        raw = raw.resize((W, H), Image.Resampling.LANCZOS)
    raw = ImageEnhance.Contrast(raw).enhance(1.04)
    base = prep_base(raw)  # lề cho ox

    flight = [render_skill_frame(base, i, rgb, feel) for i in range(1, N + 1)]
    save_stem(dest, "flight", flight)
    write_preview(dest, flight, tag)

    if not flight_only:
        charge = [render_charge_stem(base, i, rgb, feel) for i in range(1, N + 1)]
        impact = [render_impact_stem(base, i, rgb, feel, strike=False) for i in range(1, N + 1)]
        strike = [render_impact_stem(base, i, rgb, feel, strike=True) for i in range(1, N + 1)]
        save_stem(dest, "charge", charge)
        save_stem(dest, "impact", impact)
        save_stem(dest, "strike", strike)

    ok, reason = qa_horizontal(flight)
    print(f"    QA {'PASS' if ok else 'FAIL'}: {reason}")
    (dest / "README.md").write_text(
        f"""# qi {tag}

Art giữ `_ref_*`. Motion chiêu: tụ → lao ngang → tan.

Gen: `python3 scripts/gen-qi-skill-motion.py {tag}`
Preview: `_preview_{tag}.gif`
""",
        encoding="utf-8",
    )
    return ok


def main() -> None:
    flags = set(sys.argv[1:])
    wanted = [a for a in sys.argv[1:] if a in PACKS] or list(PACKS.keys())
    order = [t for t in ("ho", "soi", "loi", "hon", "phong") if t in wanted]
    # soi / --flight-only → chỉ ghi flight + preview
    flight_only_all = "--flight-only" in flags
    results = []
    for tag in order:
        fo = flight_only_all or tag == "soi"
        ok = gen_pack(tag, flight_only=fo)
        results.append((tag, ok))
    print("———")
    for tag, ok in results:
        print(f"{'PASS' if ok else 'FAIL'} {tag}")
    if any(not ok for _, ok in results):
        raise SystemExit(1)
    print("done")


if __name__ == "__main__":
    main()
