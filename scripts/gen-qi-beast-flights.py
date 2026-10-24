#!/usr/bin/env python3
"""
Regenerate dramatic, fierce flight flipbooks for mythical beast skills:
- ho (tiger): Predatory pounce + 3-claw razor swipe & amber flame marks
- soi (wolf): Predatory pounce + 3-claw frost swipe & cyan ice marks
- loi (thunder beast): Predatory pounce + lightning claw strike
- phong (wind bird): Falcon wing beat (high upstroke / downstroke) + crescent wind blades
- xa (snake): Deep serpentine S-wave (User confirmed OK)
- thuy (water serpent): Deep serpentine S-wave (User confirmed OK)
"""
from __future__ import annotations

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
FX = ROOT / "assets/fx/skill"

W, H, N = 384, 192, 24
KEY_IDX = (1, 8, 16, 24)
PI2 = math.tau

PACK_DEFS = [
    {
        "tag": "ho",
        "rel": "ho/qi_tiger",
        "ref": "ho/qi_tiger/_ref_tiger.png",
        "motion": "pounce_claw",
        "rgb": (255, 145, 30),
        "amp": 24.0,
    },
    {
        "tag": "soi",
        "rel": "soi/qi_wolf",
        "ref": "soi/qi_wolf/_ref_wolf.png",
        "motion": "pounce_claw",
        "rgb": (130, 215, 255),
        "amp": 23.0,
    },
    {
        "tag": "loi",
        "rel": "loi/qi_thunder",
        "ref": "loi/qi_thunder/_ref_thunder.png",
        "motion": "pounce_claw",
        "rgb": (255, 230, 75),
        "amp": 25.0,
    },
    {
        "tag": "phong",
        "rel": "phong/qi_wind",
        "ref": "phong/qi_wind/_ref_wind.png",
        "motion": "falcon_dive",
        "rgb": (90, 245, 205),
        "amp": 24.0,
    },
    {
        "tag": "xa",
        "rel": "xa/qi_poison",
        "ref": "xa/qi_poison/_ref_poison.png",
        "motion": "serpentine_deep",
        "rgb": (70, 245, 110),
        "amp": 34.0,
    },
    {
        "tag": "thuy",
        "rel": "thuy/qi_water",
        "ref": "thuy/qi_water/_ref_water.png",
        "motion": "serpentine_deep",
        "rgb": (55, 175, 255),
        "amp": 34.0,
    },
]

def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))

def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t

def content_x_range(im: Image.Image, thr: int = 20) -> tuple[int, int]:
    a = im.split()[3]
    px = a.load()
    xs = [x for x in range(im.size[0]) for y in range(0, im.size[1], 2) if px[x, y] > thr]
    if not xs:
        return 0, im.size[0] - 1
    return min(xs), max(xs)

def prep_ref_with_headroom(src: Image.Image, fit_ratio: float = 0.74) -> Image.Image:
    w, h = src.size
    bbox = src.getbbox()
    if not bbox:
        return src.copy()
    cur_w = bbox[2] - bbox[0]
    cur_h = bbox[3] - bbox[1]
    
    target_h = int(h * fit_ratio)
    target_w = int(w * 0.85)
    
    scale = min(target_w / cur_w, target_h / cur_h)
    new_w = max(8, int(cur_w * scale))
    new_h = max(8, int(cur_h * scale))
    
    cropped = src.crop(bbox)
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ox = int(w * 0.90 - new_w)
    oy = (h - new_h) // 2
    canvas.alpha_composite(resized, (ox, oy))
    return canvas

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

def warp_pounce_claw(base: Image.Image, frame_i: int, rgb: tuple[int, int, int]) -> Image.Image:
    """
    HOẠT ẢNH NHẢY VỒ VÀ CÀO KẺ ĐỊCH (Pounce & Claw Swipe):
    - Frame 01-06: Thu mình, hạ thấp vai, dồn lực
    - Frame 07-12: Bật nhảy không trung, cơ thể vươn dài
    - Frame 13-19: CHỒM BỔ VÀ CÀO XÉ: Thân chúc -18°, 3 vệt móng vuốt khí thế xé toạc phía trước!
    - Frame 20-24: Thu thế hoàn tất chu kỳ
    """
    t = (frame_i - 1) / float(N)
    phase = t * PI2
    w, h = base.size
    x0, x1 = content_x_range(base)
    span = max(1, x1 - x0)
    
    if t < 0.25:
        u = t / 0.25
        pitch = lerp(0.0, 7.0, math.sin(u * math.pi * 0.5))
        leap_y = lerp(0.0, 8.0, u)
        stretch_x = lerp(1.0, 0.90, u)
    elif t < 0.50:
        u = (t - 0.25) / 0.25
        pitch = lerp(7.0, -4.0, u)
        leap_y = lerp(8.0, -18.0, math.sin(u * math.pi * 0.5))
        stretch_x = lerp(0.90, 1.15, u)
    elif t < 0.80:
        u = (t - 0.50) / 0.30
        pitch = lerp(-4.0, -18.0, math.sin(u * math.pi * 0.5))
        leap_y = lerp(-18.0, 10.0, u)
        stretch_x = lerp(1.15, 1.05, u)
    else:
        u = (t - 0.80) / 0.20
        pitch = lerp(-18.0, 0.0, u)
        leap_y = lerp(10.0, 0.0, u)
        stretch_x = lerp(1.05, 1.0, u)
        
    rotated = base.rotate(pitch, resample=Image.Resampling.BICUBIC, expand=False)
    
    dys = [0.0] * w
    for x in range(w):
        s = clamp((x - x0) / span, 0.0, 1.0)
        paw_thrust = 0.0
        if 0.45 <= t <= 0.85 and s > 0.65:
            u_paw = (t - 0.45) / 0.40
            paw_thrust = 22.0 * math.sin(u_paw * math.pi)
        rear_lift = -12.0 * math.sin(phase) * ((1.0 - s) ** 1.3)
        dys[x] = leap_y + paw_thrust + rear_lift
        
    for _ in range(4):
        tmp = dys[:]
        for x in range(2, w - 2):
            tmp[x] = (dys[x - 2] + dys[x - 1] * 2 + dys[x] * 3 + dys[x + 1] * 2 + dys[x + 2]) / 9
        dys = tmp
        
    warped = _splat_columns(rotated, dys)
    
    nw = max(8, int(w * stretch_x))
    scaled = warped.resize((nw, h), Image.Resampling.BILINEAR)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ox = (w - nw) // 2
    canvas.alpha_composite(scaled, (ox, 0))
    
    # 3 VỆT MÓNG VUỐT CÀO XÉ (Claw Slashes) quét chém ở pha bổ nhào
    if 0.50 <= t <= 0.82:
        u_slash = (t - 0.50) / 0.32
        d = ImageDraw.Draw(canvas)
        
        cx = int(w * 0.78 + u_slash * 28)
        cy = int(h * 0.52 + u_slash * 36)
        slash_len = 42.0 + 16.0 * math.sin(u_slash * math.pi)
        ang = math.radians(-50 + u_slash * 75)
        
        alpha = int(245 * math.sin(u_slash * math.pi))
        for ci in (-1, 0, 1):
            offset_y = ci * 14
            offset_x = ci * 10
            x1 = cx + offset_x - math.cos(ang) * (slash_len * 0.5)
            y1 = cy + offset_y - math.sin(ang) * (slash_len * 0.5)
            x2 = cx + offset_x + math.cos(ang) * (slash_len * 0.5)
            y2 = cy + offset_y + math.sin(ang) * (slash_len * 0.5)
            
            d.line([(x1, y1), (x2, y2)], fill=(*rgb, alpha), width=3)
            d.line([(x1 + 1, y1 + 1), (x2 - 1, y2 - 1)], fill=(255, 255, 230, alpha), width=1)
            d.ellipse([x2 - 3, y2 - 3, x2 + 3, y2 + 3], fill=(255, 255, 240, alpha))
            
    return canvas

def warp_falcon_dive(base: Image.Image, frame_i: int, rgb: tuple[int, int, int]) -> Image.Image:
    """
    HOẠT ẢNH VỖ CÁNH MẠNH & BỔ NHÀO CÀO KẺ ĐỊCH CHO PHONG ĐIỂU:
    - 2 chu kỳ đập cánh dứt khoát
    - Upstroke: Cánh giương cao đón gió, thân ngửa đón lực
    - Downstroke: Cánh đập dập mạnh xuống dưới, thân chúc mỏ bổ nhào cắm thẳng vào mục tiêu
    - Đồng thời 2 LƯỠI PHONG ĐAO (Crescent Wind Slashes) quét vung chém vút về phía trước!
    """
    t = (frame_i - 1) / float(N)
    w, h = base.size
    x0, x1 = content_x_range(base)
    span = max(1, x1 - x0)
    
    flap_phase = (t * 2.0) % 1.0
    if flap_phase < 0.65:
        u_up = flap_phase / 0.65
        wing_y = lerp(18.0, -28.0, math.sin(u_up * math.pi * 0.5))
        tilt = lerp(-12.0, 8.0, u_up)
        dive_y = lerp(8.0, -10.0, u_up)
    else:
        u_down = (flap_phase - 0.65) / 0.35
        wing_y = lerp(-28.0, 20.0, math.sin(u_down * math.pi * 0.5))
        tilt = lerp(8.0, -18.0, math.sin(u_down * math.pi * 0.5))
        dive_y = lerp(-10.0, 12.0, u_down)
        
    rotated = base.rotate(tilt, resample=Image.Resampling.BICUBIC, expand=False)
    
    dys = [0.0] * w
    for x in range(w):
        s = clamp((x - x0) / span, 0.0, 1.0)
        wing_w = math.sin(s * math.pi * 0.8) ** 1.3
        dys[x] = dive_y + wing_y * wing_w
        
    for _ in range(4):
        tmp = dys[:]
        for x in range(2, w - 2):
            tmp[x] = (dys[x - 2] + dys[x - 1] * 2 + dys[x] * 3 + dys[x + 1] * 2 + dys[x + 2]) / 9
        dys = tmp
        
    canvas = _splat_columns(rotated, dys)
    
    # 2 LƯỠI PHONG ĐAO CHÉM GIÓ quét ra khi đập cánh bổ nhào
    if flap_phase >= 0.65:
        u_slash = (flap_phase - 0.65) / 0.35
        d = ImageDraw.Draw(canvas)
        alpha = int(240 * math.sin(u_slash * math.pi))
        cx = int(w * 0.74 + u_slash * 35)
        cy = int(h * 0.50 + u_slash * 22)
        
        blade_r = 30 + int(10 * math.sin(u_slash * math.pi))
        ang1 = -65 + u_slash * 45
        ang2 = ang1 + 70
        
        for bo, r_add in ((0, 0), (-16, -8)):
            bx = cx + bo
            by = cy + bo * 0.5
            r = blade_r + r_add
            bbox = [bx - r, by - r, bx + r, by + r]
            d.arc(bbox, start=ang1, end=ang2, fill=(*rgb, alpha), width=3)
            d.arc(bbox, start=ang1 + 5, end=ang2 - 5, fill=(230, 255, 250, alpha), width=1)
            
    return canvas

def warp_serpentine_deep(src: Image.Image, phase: float, amp: float = 34.0) -> Image.Image:
    """Uốn lượn sâu cuồn cuộn cho Độc Xà & Thủy Quái (User OK)."""
    w, h = src.size
    x0, x1 = content_x_range(src)
    span = max(1, x1 - x0)
    head_frac = 0.22
    head_dampen = 0.08
    waves = 1.18
    dys = [0.0] * w
    for x in range(w):
        s = clamp((x - x0) / span, 0.0, 1.0)
        head_t = clamp((s - (1.0 - head_frac)) / max(1e-6, head_frac), 0.0, 1.0)
        head_t = head_t * head_t * (3 - 2 * head_t)
        damp = lerp(1.0, head_dampen, head_t)
        lag = 1.25 * (1.0 - s)
        dys[x] = amp * damp * math.sin(waves * PI2 * s + phase - lag)
        
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
        
    max_step = 0.85
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

def add_ethereal_wisps(im: Image.Image, phase: float, rgb: tuple[int, int, int]) -> Image.Image:
    w, h = im.size
    x0, x1 = content_x_range(im)
    span = max(1, x1 - x0)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    for i in range(12):
        t_w = (phase + i * (PI2 / 12)) % PI2
        spawn_x = x0 + span * 0.65 - (i * 14) % int(span * 0.6)
        drift = (t_w / PI2) * 45.0
        px = spawn_x - drift
        py = h * 0.48 + math.sin(t_w * 2 + i) * (h * 0.26)
        r = 1.5 + (i % 3) * 0.8
        alpha = int(140 * (1.0 - (drift / 45.0)))
        if alpha > 10 and 0 <= px < w and 0 <= py < h:
            d.ellipse([px - r, py - r, px + r, py + r], fill=(*rgb, alpha))

    blurred = layer.filter(ImageFilter.GaussianBlur(radius=1.2))
    result = Image.alpha_composite(blurred, im)
    result = Image.alpha_composite(result, layer)
    return result

def generate_beast_pack(cfg: dict) -> None:
    tag = cfg["tag"]
    dest = ROOT / f"assets/fx/skill/{cfg['rel']}"
    ref_path = ROOT / f"assets/fx/skill/{cfg['ref']}"
    dest.mkdir(parents=True, exist_ok=True)
    key_dir = dest / "qi_key"
    key_dir.mkdir(parents=True, exist_ok=True)

    raw_base = Image.open(ref_path).convert("RGBA")
    base = prep_ref_with_headroom(raw_base, fit_ratio=0.72 if cfg["motion"] == "falcon_dive" else 0.74)
    
    motion = cfg["motion"]
    rgb = cfg["rgb"]
    amp = cfg["amp"]

    flight_frames = []
    for f in range(1, N + 1):
        phase = (f - 1) / float(N) * PI2
        if motion == "pounce_claw":
            frame = warp_pounce_claw(base, f, rgb)
        elif motion == "falcon_dive":
            frame = warp_falcon_dive(base, f, rgb)
        elif motion == "serpentine_deep":
            frame = warp_serpentine_deep(base, phase, amp=amp)
        else:
            frame = base.copy()

        frame = add_ethereal_wisps(frame, phase, rgb)
        flight_frames.append(frame)

    ki = 1
    for i, fr in enumerate(flight_frames, start=1):
        fr.save(dest / f"flight_{i:02d}.png", optimize=True)
        if i in KEY_IDX:
            fr.save(key_dir / f"flight_{ki:02d}.png", optimize=True)
            ki += 1

    gif_path = dest / f"_preview_{tag}.gif"
    flight_frames[0].save(
        gif_path,
        save_all=True,
        append_images=flight_frames[1:],
        duration=int(1000 / 20),
        loop=0,
        disposal=2,
    )
    print(f"✓ Generated {tag}: 24 in-place flight frames + preview GIF at {gif_path}")

def main():
    print("Regenerating combat-attack flight sheets for all beast skills...")
    for cfg in PACK_DEFS:
        generate_beast_pack(cfg)
    print("Done generating beast flight flipbooks!")

if __name__ == "__main__":
    main()
