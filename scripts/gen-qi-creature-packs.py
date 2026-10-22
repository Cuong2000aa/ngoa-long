#!/usr/bin/env python3
"""
Gen qi_* packs từ REF ĐÚNG LOÀI — không remap silhouette rồng.

Motion:
  serpentine — xà / thủy (thân dài uốn)
  gallop     — hổ / sói / lôi thú (tóe + nảy cả thân)
  flap       — phong điểu
  spin       — bát quái
  drift      — linh hồn

Dragon variants (azure/ivory) vẫn từ qi_fire qua gen-qi-spirit-packs.py.

Usage:
  python3 scripts/gen-qi-creature-packs.py
"""
from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
FX = ROOT / "assets/fx"
ASSETS_SRC = Path("/Users/it/.cursor/projects/Users-it-Documents-3Q/assets")

W, H = 384, 192
N = 24
PI2 = math.tau
KEY_IDX = (1, 8, 16, 24)

# Chỉ xà/thủy (serpentine). Hồn thú chiêu: gen-qi-skill-motion.py
# bagua: không đụng.
PACKS = [
    ("skill/xa/qi_poison", "ref_snake_spirit.jpg", "serpentine", (80, 255, 120), "xa"),
    ("skill/thuy/qi_water", "ref_water_spirit.jpg", "serpentine", (60, 180, 255), "thuy"),
]


def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def knockout_black(im: Image.Image, thr: int = 28) -> Image.Image:
    """RGB/near-black → alpha. Soft edge."""
    src = im.convert("RGBA")
    px = src.load()
    w, h = src.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            lum = (r + g + b) / 3
            if lum <= thr:
                px[x, y] = (r, g, b, 0)
            elif lum < thr + 40:
                t = (lum - thr) / 40.0
                px[x, y] = (r, g, b, int(a * t))
    return src


def fit_canvas(im: Image.Image) -> Image.Image:
    """Crop content bbox, scale to fit W×H, center."""
    im = im.convert("RGBA")
    bbox = im.split()[3].getbbox()
    if not bbox:
        return Image.new("RGBA", (W, H), (0, 0, 0, 0))
    # pad bbox a bit
    x0, y0, x1, y1 = bbox
    pad = 8
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(im.size[0], x1 + pad), min(im.size[1], y1 + pad)
    crop = im.crop((x0, y0, x1, y1))
    cw, ch = crop.size
    # target fill ~88% canvas
    scale = min((W * 0.92) / cw, (H * 0.88) / ch)
    nw, nh = max(8, int(cw * scale)), max(8, int(ch * scale))
    small = crop.resize((nw, nh), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ox = (W - nw) // 2
    oy = (H - nh) // 2
    out.alpha_composite(small, (ox, oy))
    return out


def content_x_range(im: Image.Image, thr: int = 20) -> tuple[int, int]:
    a = im.split()[3]
    px = a.load()
    xs = [x for x in range(im.size[0]) for y in range(0, im.size[1], 2) if px[x, y] > thr]
    if not xs:
        return 0, im.size[0] - 1
    return min(xs), max(xs)


def warp_serpentine(
    src: Image.Image,
    phase: float,
    *,
    amp: float = 22.0,
    waves: float = 1.15,
    head_frac: float = 0.22,
    head_dampen: float = 0.12,
) -> Image.Image:
    src = src.convert("RGBA")
    w, h = src.size
    x0, x1 = content_x_range(src)
    span = max(1, x1 - x0)
    dys = [0.0] * w
    for x in range(w):
        s = clamp((x - x0) / span, 0.0, 1.0)
        head_t = clamp((s - (1.0 - head_frac)) / max(1e-6, head_frac), 0.0, 1.0)
        head_t = head_t * head_t * (3 - 2 * head_t)
        damp = lerp(1.0, head_dampen, head_t)
        lag = 1.2 * (1.0 - s)
        dys[x] = amp * damp * (
            0.8 * math.sin(waves * PI2 * s + phase - lag)
            + 0.2 * math.sin(waves * 2.0 * PI2 * s + phase * 1.1 - lag * 0.75)
        )
    for _ in range(4):
        tmp = dys[:]
        for x in range(3, w - 3):
            tmp[x] = (
                dys[x - 3] * 0.05
                + dys[x - 2] * 0.1
                + dys[x - 1] * 0.2
                + dys[x] * 0.3
                + dys[x + 1] * 0.2
                + dys[x + 2] * 0.1
                + dys[x + 3] * 0.05
            )
        dys = tmp
    max_step = 0.28
    for _ in range(6):
        for x in range(1, w):
            d = dys[x] - dys[x - 1]
            if abs(d) > max_step:
                dys[x] = dys[x - 1] + math.copysign(max_step, d)
        for x in range(w - 2, -1, -1):
            d = dys[x] - dys[x + 1]
            if abs(d) > max_step:
                dys[x] = dys[x + 1] + math.copysign(max_step, d)
    return _splat_columns(src, dys)


def warp_gallop(src: Image.Image, phase: float, *, amp: float = 14.0) -> Image.Image:
    """Hổ/sót: nảy cả thân + đuôi (trái) lag nhẹ — giữ silhouette thú, không biến thành rắn."""
    src = src.convert("RGBA")
    w, h = src.size
    x0, x1 = content_x_range(src)
    span = max(1, x1 - x0)
    bounce = amp * math.sin(phase)
    stretch = 1.0 + 0.04 * math.sin(phase * 2)
    dys = [0.0] * w
    for x in range(w):
        s = clamp((x - x0) / span, 0.0, 1.0)
        # đầu (phải) vững; đuôi nảy nhiều hơn + phase lag
        rear = (1.0 - s) ** 1.35
        dys[x] = bounce * (0.55 + 0.45 * rear) + rear * amp * 0.35 * math.sin(phase - 0.9)
    for _ in range(3):
        tmp = dys[:]
        for x in range(2, w - 2):
            tmp[x] = (dys[x - 2] + dys[x - 1] * 2 + dys[x] * 3 + dys[x + 1] * 2 + dys[x + 2]) / 9
        dys = tmp
    out = _splat_columns(src, dys)
    # mild vertical stretch around mid
    nh = max(8, int(h * stretch))
    stretched = out.resize((w, nh), Image.Resampling.BILINEAR)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    oy = (h - nh) // 2
    canvas.alpha_composite(stretched, (0, oy))
    return canvas


def warp_flap(src: Image.Image, phase: float) -> Image.Image:
    """Chim: xoay nhẹ + warp cánh (nửa trên)."""
    angle = 6.0 * math.sin(phase)
    rotated = src.rotate(angle, resample=Image.Resampling.BICUBIC, expand=False)
    w, h = rotated.size
    x0, x1 = content_x_range(rotated)
    span = max(1, x1 - x0)
    flap = 10.0 * math.sin(phase * 2)
    dys = [0.0] * w
    for x in range(w):
        s = clamp((x - x0) / span, 0.0, 1.0)
        # cánh giữa thân
        wing = math.sin(s * math.pi) ** 1.2
        dys[x] = flap * wing * (0.4 + 0.6 * (1 - s))
    return _splat_columns(rotated, dys)


def warp_spin(src: Image.Image, phase: float) -> Image.Image:
    angle = (phase / PI2) * 360.0
    pulse = 1.0 + 0.06 * math.sin(phase * 2)
    nw, nh = max(8, int(W * pulse)), max(8, int(H * pulse))
    scaled = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.alpha_composite(scaled, ((W - nw) // 2, (H - nh) // 2))
    return canvas.rotate(angle, resample=Image.Resampling.BICUBIC, expand=False)


def warp_drift(src: Image.Image, phase: float) -> Image.Image:
    amp = 10.0
    w, h = src.size
    x0, x1 = content_x_range(src)
    span = max(1, x1 - x0)
    dys = [0.0] * w
    for x in range(w):
        s = clamp((x - x0) / span, 0.0, 1.0)
        dys[x] = amp * math.sin(phase + s * 1.8) * (0.5 + 0.5 * (1 - s))
    out = _splat_columns(src, dys)
    # soft alpha breathe
    a = out.split()[3]
    mul = 0.85 + 0.15 * (0.5 + 0.5 * math.sin(phase))
    out.putalpha(a.point(lambda p: int(p * mul)))
    return out


def _splat_columns(src: Image.Image, dys: list[float]) -> Image.Image:
    w, h = src.size
    acc_r = [0.0] * (w * h)
    acc_g = [0.0] * (w * h)
    acc_b = [0.0] * (w * h)
    acc_a = [0.0] * (w * h)
    acc_w = [0.0] * (w * h)
    sp = src.load()

    def splat(dx: int, dyf: float, col: tuple[int, int, int, int], wt: float) -> None:
        if col[3] < 2 or wt <= 0:
            return
        y0 = int(math.floor(dyf))
        fy = dyf - y0
        for oy, wy in ((y0, 1 - fy), (y0 + 1, fy)):
            if oy < 0 or oy >= h or wy < 0.001:
                continue
            i = oy * w + dx
            aw = wt * wy * (col[3] / 255.0)
            acc_r[i] += col[0] * aw
            acc_g[i] += col[1] * aw
            acc_b[i] += col[2] * aw
            acc_a[i] += col[3] * wt * wy
            acc_w[i] += aw

    for x in range(w):
        dy = dys[x]
        for y in range(h):
            col = sp[x, y]
            if col[3] < 2:
                continue
            for ox, wx in ((x - 1, 0.15), (x, 0.7), (x + 1, 0.15)):
                if 0 <= ox < w:
                    splat(ox, y + dy, col, wx)

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for i in range(w * h):
        ww = acc_w[i]
        if ww < 0.02:
            continue
        x = i % w
        y = i // w
        a = int(clamp(acc_a[i] / max(ww, 0.001) * (ww / (ww + 0.15)), 0, 255))
        if a < 2:
            continue
        op[x, y] = (
            int(clamp(acc_r[i] / ww, 0, 255)),
            int(clamp(acc_g[i] / ww, 0, 255)),
            int(clamp(acc_b[i] / ww, 0, 255)),
            a,
        )
    return out


def apply_motion(base: Image.Image, motion: str, phase: float, *, amp_scale: float = 1.0) -> Image.Image:
    if motion == "serpentine":
        return warp_serpentine(base, phase, amp=18 * amp_scale + 8, waves=1.1, head_frac=0.2, head_dampen=0.1)
    if motion == "gallop":
        return warp_gallop(base, phase, amp=12 * amp_scale + 4)
    if motion == "flap":
        return warp_flap(base, phase)
    if motion == "spin":
        return warp_spin(base, phase)
    if motion == "drift":
        return warp_drift(base, phase)
    return base.copy()


def soft_vortex(im: Image.Image, t: float, rgb: tuple[int, int, int]) -> Image.Image:
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = int(W * 0.38), int(H * 0.55)
    rmax = int(lerp(12, 48, t))
    for i in range(5, 0, -1):
        rr = rmax * i / 5
        a = int(40 * t * (i / 5))
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(*rgb, a), width=2)
    return Image.alpha_composite(layer, im)


def render_flight(base: Image.Image, motion: str, frame_i: int) -> Image.Image:
    t = (frame_i - 1) / N
    phase = t * PI2
    return apply_motion(base, motion, phase, amp_scale=1.0 + 0.15 * math.sin(phase))


def render_charge(base: Image.Image, motion: str, rgb: tuple[int, int, int], frame_i: int) -> Image.Image:
    t = (frame_i - 1) / (N - 1)
    scale = lerp(0.35, 1.0, clamp((t - 0.15) / 0.7, 0, 1))
    phase = t * PI2 * 0.6
    posed = apply_motion(base, motion, phase, amp_scale=0.5 + 0.5 * t)
    nw, nh = int(W * scale), int(H * scale)
    small = posed.resize((max(8, nw), max(8, nh)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ox = int((W - small.size[0]) * 0.28)
    oy = int((H - small.size[1]) * 0.5)
    canvas.alpha_composite(small, (ox, oy))
    if t < 0.35:
        a = canvas.split()[3].point(lambda p: int(p * (t / 0.35)))
        canvas.putalpha(a)
    return soft_vortex(canvas, min(1.0, t * 1.2), rgb)


def render_impact(
    base: Image.Image, motion: str, rgb: tuple[int, int, int], frame_i: int, *, strike: bool = False
) -> Image.Image:
    t = (frame_i - 1) / (N - 1)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    if t < 0.3:
        u = t / 0.3
        fr = apply_motion(base, motion, 0.4, amp_scale=0.7)
        shift = int(lerp(-80, 20, u))
        canvas.alpha_composite(fr, (shift, 0))
    elif t < 0.6:
        u = (t - 0.3) / 0.3
        fr = apply_motion(base, motion, 0.8, amp_scale=0.5)
        canvas.alpha_composite(fr)
        for k in range(14):
            ang = k / 14 * PI2 + u * 1.5
            dist = int(20 + u * 50)
            cx = int(W * 0.62 + math.cos(ang) * dist)
            cy = int(H * 0.5 + math.sin(ang) * dist * 0.85)
            chunk = fr.crop((220, 40, 340, 150)).resize((28, 22), Image.Resampling.BILINEAR)
            a = chunk.split()[3].point(lambda p: int(p * (1 - u * 0.6)))
            chunk.putalpha(a)
            canvas.alpha_composite(chunk, (cx - 14, cy - 11))
        if strike:
            for yy in range(20, H - 20, 6):
                d.ellipse(
                    [W * 0.58 - 4, yy - 3, W * 0.58 + 4, yy + 3],
                    fill=(*rgb, int(120 * (1 - u))),
                )
    else:
        u = (t - 0.6) / 0.4
        fr = apply_motion(base, motion, 1.2, amp_scale=0.35)
        a = fr.split()[3].point(lambda p: int(p * (1 - u)))
        fr.putalpha(a)
        canvas.alpha_composite(fr)
        for k in range(18):
            ang = k * 0.7 + u * 2
            dist = 30 + u * 60
            x = W * 0.6 + math.cos(ang) * dist
            y = H * 0.5 + math.sin(ang) * dist * 0.9 - u * 20
            r = 3 + (k % 3)
            d.ellipse([x - r, y - r, x + r, y + r], fill=(*rgb, int(180 * (1 - u))))
    return canvas.filter(ImageFilter.GaussianBlur(radius=0.4))


def save_stem(dest: Path, stem: str, frames: list[Image.Image]) -> None:
    key_dir = dest / "qi_key"
    key_dir.mkdir(parents=True, exist_ok=True)
    for old in dest.glob(f"{stem}_*.png"):
        old.unlink()
    for old in key_dir.glob(f"{stem}_*.png"):
        old.unlink()
    ki = 1
    for i, fr in enumerate(frames, start=1):
        fr.save(dest / f"{stem}_{i:02d}.png", optimize=True)
        if i in KEY_IDX:
            fr.save(key_dir / f"{stem}_{ki:02d}.png", optimize=True)
            ki += 1


def write_preview(dest: Path, flight: list[Image.Image], tag: str) -> None:
    """tag riêng từng pack — `_preview_ho.gif`, `_preview_soi.gif`, …"""
    gif = dest / f"_preview_{tag}.gif"
    contact = dest / f"_preview_{tag}_contact.png"
    # dọn tên cũ chung
    for old in dest.glob("_preview_flight*"):
        old.unlink()
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


def prepare_ref(src_path: Path, dest: Path, name: str) -> Image.Image:
    raw = Image.open(src_path)
    # keep source copy
    shutil.copy2(src_path, dest / f"_ref_src{src_path.suffix}")
    cut = knockout_black(raw)
    base = fit_canvas(cut)
    # slight contrast for combat readability
    base = ImageEnhance.Contrast(base).enhance(1.08)
    base = ImageEnhance.Color(base).enhance(1.05)
    base.save(dest / f"_ref_{name}.png")
    return base


def gen_pack(rel: str, ref_name: str, motion: str, rgb: tuple[int, int, int], tag: str) -> None:
    src = ASSETS_SRC / ref_name
    if not src.exists():
        raise SystemExit(f"Missing ref: {src}")
    dest = FX / rel
    dest.mkdir(parents=True, exist_ok=True)
    label = rel.split("/")[-1]
    print(f"→ {rel}  motion={motion}  preview=_{tag}")
    base = prepare_ref(src, dest, label.replace("qi_", ""))
    flight = [render_flight(base, motion, i) for i in range(1, N + 1)]
    charge = [render_charge(base, motion, rgb, i) for i in range(1, N + 1)]
    impact = [render_impact(base, motion, rgb, i, strike=False) for i in range(1, N + 1)]
    strike = [render_impact(base, motion, rgb, i, strike=True) for i in range(1, N + 1)]
    save_stem(dest, "flight", flight)
    save_stem(dest, "charge", charge)
    save_stem(dest, "impact", impact)
    save_stem(dest, "strike", strike)
    write_preview(dest, flight, tag)
    (dest / "README.md").write_text(
        f"""# {label}

Ref đúng loài (`_ref_*.png`), motion `{motion}` — **không** remap từ rồng.

Gen: `python3 scripts/gen-qi-creature-packs.py`
Preview: `_preview_{tag}.gif`
""",
        encoding="utf-8",
    )
    print(f"    flight/charge/impact/strike ×{N}")


def main() -> None:
    for rel, ref, motion, rgb, tag in PACKS:
        gen_pack(rel, ref, motion, rgb, tag)
    # dragon palette variants only
    print("→ azure/ivory vẫn từ qi_fire (rồng thật)")
    print("done")


if __name__ == "__main__":
    main()
