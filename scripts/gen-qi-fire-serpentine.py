#!/usr/bin/env python3
"""
REGEN qi_fire từ ảnh rồng tham chiếu — KHÔNG vẽ ống sáng.

- Base art: _ref_dragon.png (rồng thật: đầu/thân/vảy/móng)
- Flight: warp thân theo sóng sin; đầu ổn định bên phải
- Remap cyan → lửa cam cho qi_fire
- Charge / impact: biến thể từ cùng asset

Usage:
  python3 scripts/gen-qi-fire-serpentine.py
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/fx/skill/rong/qi_fire"
KEY = OUT / "qi_key"
REF = OUT / "_ref_dragon.png"
REF_SRC = Path(
    "/Users/it/.cursor/projects/Users-it-Documents-3Q/assets/flight_18-591001ff-0f08-4a87-8b6b-71bfd5aa81a1.png"
)
PREVIEW = OUT / "_preview_rong.gif"
CONTACT = OUT / "_preview_rong_contact.png"

W, H = 384, 192
N = 24
PI2 = math.tau


def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def ensure_ref() -> Image.Image:
    OUT.mkdir(parents=True, exist_ok=True)
    if REF.exists():
        return Image.open(REF).convert("RGBA")
    if REF_SRC.exists():
        try:
            im = Image.open(REF_SRC).convert("RGBA")
            if im.size != (W, H):
                im = im.resize((W, H), Image.Resampling.LANCZOS)
            im.save(REF)
            return im
        except Exception:
            pass
    raise SystemExit(f"Missing dragon ref: {REF}")


def to_fire_palette(im: Image.Image) -> Image.Image:
    """Cyan/teal dragon → cam-vàng-đỏ (giữ alpha + silhouette)."""
    src = im.convert("RGBA")
    h, s, v = src.convert("HSV").split()
    a = src.split()[3]
    hx, sx, vx = h.load(), s.load(), v.load()
    w, hh = src.size
    for y in range(hh):
        for x in range(w):
            if a.getpixel((x, y)) < 6:
                continue
            h0 = hx[x, y] / 255.0 * 360.0
            s0 = sx[x, y] / 255.0
            v0 = vx[x, y] / 255.0
            # cyan/teal/blue-green → orange fire (~18–35°)
            # keep near-white highlights
            if v0 > 0.88 and s0 < 0.28:
                new_h, new_s, new_v = 42.0, min(1.0, s0 * 0.9 + 0.15), min(1.0, v0 * 1.05)
            else:
                # map source hue into fire band, boost sat for body
                new_h = 22.0 + 18.0 * math.sin((h0 / 360.0) * PI2)  # slight variation
                new_s = min(1.0, max(0.35, s0 * 1.15 + 0.2))
                new_v = min(1.0, v0 * 1.08)
            hx[x, y] = int(new_h / 360.0 * 255) % 256
            sx[x, y] = int(clamp(new_s * 255, 0, 255))
            vx[x, y] = int(clamp(new_v * 255, 0, 255))
    out = Image.merge("HSV", (h, s, v)).convert("RGBA")
    out.putalpha(a)
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
    """
    Warp dọc Y theo cột X: đuôi uốn mạnh, đầu (phải) gần cố định.
    damp LIÊN TỤC theo s (0→1) — cấm nhảy bậc ở cổ (gây seam đỏ).
    """
    src = src.convert("RGBA")
    w, h = src.size
    x0, x1 = content_x_range(src)
    span = max(1, x1 - x0)

    # Precompute dy(x) — smooth damp đầu, không nhảy bậc
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

    # 1) blur rộng 2) clamp |Δdy| giữa cột — tránh xé cổ/thân (seam dọc)
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
    max_step = 0.85  # px / cột — cho phép sóng uốn lượn sâu mà không bị xé thân
    for _ in range(6):
        for x in range(1, w):
            d = dys[x] - dys[x - 1]
            if abs(d) > max_step:
                dys[x] = dys[x - 1] + math.copysign(max_step, d)
        for x in range(w - 2, -1, -1):
            d = dys[x] - dys[x + 1]
            if abs(d) > max_step:
                dys[x] = dys[x + 1] + math.copysign(max_step, d)

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    # accum buffers for soft splat (lấp lỗ khi shear)
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

    # Forward splat mỗi cột nguồn → y+dy, phủ ±1 cột ngang (không đứt)
    for x in range(w):
        dy = dys[x]
        for y in range(h):
            col = sp[x, y]
            if col[3] < 2:
                continue
            dest_y = y + dy
            for ox, wx in ((x - 1, 0.15), (x, 0.7), (x + 1, 0.15)):
                if 0 <= ox < w:
                    splat(ox, dest_y, col, wx)

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


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def soft_vortex(im: Image.Image, t: float) -> Image.Image:
    """Overlay xoáy tụ lực (charge) — không thay đầu rồng."""
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = int(W * 0.38), int(H * 0.55)
    rmax = int(lerp(12, 48, t))
    for i in range(5, 0, -1):
        rr = rmax * i / 5
        a = int(40 * t * (i / 5))
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(255, 140, 40, a), width=2)
    return Image.alpha_composite(layer, im)


def render_flight(base: Image.Image, frame_i: int) -> Image.Image:
    t = (frame_i - 1) / N
    phase = t * PI2
    amp = 36.0 + 8.0 * math.sin(phase)  # Uốn lượn sâu, cuộn sóng rõ rệt
    return warp_serpentine(base, phase, amp=amp, waves=1.18, head_frac=0.22, head_dampen=0.07)


def render_charge(base: Image.Image, frame_i: int) -> Image.Image:
    t = (frame_i - 1) / (N - 1)
    # 1–8: vortex only hint + tiny dragon
    # 9–16: scale up dragon from center-left
    # 17–24: full short pose ready
    scale = lerp(0.35, 1.0, clamp((t - 0.15) / 0.7, 0, 1))
    phase = t * PI2 * 0.6
    dragon = warp_serpentine(base, phase, amp=8 + 10 * t, waves=1.0, head_frac=0.28, head_dampen=0.1)
    nw, nh = int(W * scale), int(H * scale)
    small = dragon.resize((max(8, nw), max(8, nh)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ox = int((W - small.size[0]) * 0.28)
    oy = int((H - small.size[1]) * 0.5)
    canvas.alpha_composite(small, (ox, oy))
    # fade in
    if t < 0.35:
        a = canvas.split()[3].point(lambda p: int(p * (t / 0.35)))
        canvas.putalpha(a)
    return soft_vortex(canvas, min(1.0, t * 1.2))


def render_impact(base: Image.Image, frame_i: int, *, strike: bool = False) -> Image.Image:
    t = (frame_i - 1) / (N - 1)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if t < 0.3:
        u = t / 0.3
        # dragon stabbing in from left — crop/offset
        fr = warp_serpentine(base, 0.4, amp=10, waves=1.0, head_frac=0.25, head_dampen=0.1)
        shift = int(lerp(-80, 20, u))
        canvas.alpha_composite(fr, (shift, 0))
    elif t < 0.6:
        u = (t - 0.3) / 0.3
        fr = warp_serpentine(base, 0.8, amp=6, waves=1.0, head_frac=0.3, head_dampen=0.15)
        # shatter: paste pieces offset
        canvas.alpha_composite(fr)
        d = ImageDraw.Draw(canvas)
        for k in range(14):
            ang = k / 14 * PI2 + u * 1.5
            dist = int(20 + u * 50)
            cx = int(W * 0.62 + math.cos(ang) * dist)
            cy = int(H * 0.5 + math.sin(ang) * dist * 0.85)
            # sample chunk from head region
            chunk = fr.crop((260, 40, 340, 140)).resize((28, 22), Image.Resampling.BILINEAR)
            a = chunk.split()[3].point(lambda p: int(p * (1 - u * 0.6)))
            chunk.putalpha(a)
            canvas.alpha_composite(chunk, (cx - 14, cy - 11))
        if strike:
            for yy in range(20, H - 20, 6):
                d.ellipse([W * 0.58 - 4, yy - 3, W * 0.58 + 4, yy + 3], fill=(255, 180, 60, int(120 * (1 - u))))
    else:
        u = (t - 0.6) / 0.4
        fr = warp_serpentine(base, 1.2, amp=4, waves=1.0, head_frac=0.3, head_dampen=0.2)
        a = fr.split()[3].point(lambda p: int(p * (1 - u)))
        fr.putalpha(a)
        canvas.alpha_composite(fr)
        # ember spray
        d = ImageDraw.Draw(canvas)
        for k in range(18):
            ang = k * 0.7 + u * 2
            dist = 30 + u * 60
            x = W * 0.6 + math.cos(ang) * dist
            y = H * 0.5 + math.sin(ang) * dist * 0.9 - u * 20
            r = 3 + (k % 3)
            d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 120, 40, int(180 * (1 - u))))
    return canvas.filter(ImageFilter.GaussianBlur(radius=0.4))


def save_stem(stem: str, frames: list[Image.Image]) -> None:
    for old in OUT.glob(f"{stem}_*.png"):
        old.unlink()
    KEY.mkdir(parents=True, exist_ok=True)
    for old in KEY.glob(f"{stem}_*.png"):
        old.unlink()
    ki = 1
    for i, fr in enumerate(frames, start=1):
        fr.save(OUT / f"{stem}_{i:02d}.png", optimize=True)
        if i in (1, 8, 16, 24):
            fr.save(KEY / f"{stem}_{ki:02d}.png", optimize=True)
            ki += 1
    print(f"  {stem}: {len(frames)}f")


def pose_sig(im: Image.Image) -> list[float]:
    a = im.split()[3]
    w, h = im.size
    bw = w // 8
    px = a.load()
    sig = []
    for b in range(8):
        sy = sw = 0.0
        for x in range(b * bw, (b + 1) * bw):
            for y in range(h):
                v = px[x, y]
                if v > 40:
                    sy += y * v
                    sw += v
        sig.append(sy / sw if sw else h * 0.5)
    return sig


def sig_delta(a: list[float], b: list[float]) -> float:
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)


def head_pixels(im: Image.Image) -> int:
    a = im.split()[3]
    px = a.load()
    n = 0
    for x in range(270, W):
        for y in range(H):
            if px[x, y] > 40:
                n += 1
    return n


def qa(flight: list[Image.Image], base: Image.Image) -> bool:
    d12 = sig_delta(pose_sig(flight[0]), pose_sig(flight[11]))
    d18 = sig_delta(pose_sig(flight[0]), pose_sig(flight[7]))
    d816 = sig_delta(pose_sig(flight[7]), pose_sig(flight[15]))
    print(f"  QA motion 1↔12={d12:.1f} 1↔8={d18:.1f} 8↔16={d816:.1f}")
    motion_ok = d12 >= 5.0 and d18 >= 3.5

    # identity: head region still dense like ref (not empty tube tip)
    hp = [head_pixels(flight[i]) for i in (0, 7, 11, 15, 23)]
    href = head_pixels(base)
    print(f"  QA head pixels frames={hp} ref={href}")
    id_ok = all(p >= href * 0.45 for p in hp) and min(hp) >= 800

    ok = motion_ok and id_ok
    print(f"  QA TOTAL: {'PASS' if ok else 'FAIL'} (motion={motion_ok} identity={id_ok})")
    return ok


def write_preview(flight: list[Image.Image]) -> None:
    flight[0].save(
        PREVIEW,
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
    sheet.save(CONTACT)
    print(f"  → {PREVIEW.name} / {CONTACT.name}")


def main() -> None:
    print(f"→ REGEN từ ảnh rồng → {OUT.relative_to(ROOT)}")
    ref = ensure_ref()
    base = to_fire_palette(ref)
    # keep a fire-colored master for debugging
    base.save(OUT / "_ref_dragon_fire.png")

    flight = [render_flight(base, i) for i in range(1, N + 1)]
    charge = [render_charge(base, i) for i in range(1, N + 1)]
    impact = [render_impact(base, i, strike=False) for i in range(1, N + 1)]
    strike = [render_impact(base, i, strike=True) for i in range(1, N + 1)]

    save_stem("flight", flight)
    save_stem("charge", charge)
    save_stem("impact", impact)
    save_stem("strike", strike)
    write_preview(flight)
    if not qa(flight, base):
        raise SystemExit("FAIL QA")
    (OUT / "README.md").write_text(
        """# qi_fire — từ ảnh rồng tham chiếu

**Không** procedural ống sáng. Base = `_ref_dragon.png` (rồng đầu/thân/vảy),
warp thân theo sóng; remap palette lửa.

Gen: `python3 scripts/gen-qi-fire-serpentine.py`
Preview: `_preview_rong.gif`
""",
        encoding="utf-8",
    )
    print("done")


if __name__ == "__main__":
    main()
