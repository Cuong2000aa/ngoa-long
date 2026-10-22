#!/usr/bin/env python3
"""
Gen sét dọc nhiều màu từ qi_crimson (cùng motion khí thế).

Packs → assets/fx/skill/loi/{folder}/
  qi_violet  — hồn tím (trấn/tỏa/đế/truy…)
  qi_azure   — thanh long / lam
  qi_gold    — lôi vàng điện
  qi_venom   — độc lôi lục
  qi_gale    — phong lôi thanh

Không đụng qi_crimson / qi_thunder / bagua.

Usage:
  python3 scripts/gen-qi-colored-thunder.py
  python3 scripts/gen-qi-colored-thunder.py violet gold
"""
from __future__ import annotations

import colorsys
import sys
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/fx/skill/loi/qi_crimson"
LOI = ROOT / "assets/fx/skill/loi"

# tag → (folder, accent rgb, preview name, label)
PACKS = {
    "violet": ("qi_violet", (180, 120, 255), "_preview_loi_tim.gif", "lôi tím hồn"),
    "azure": ("qi_azure", (60, 200, 255), "_preview_loi_lam.gif", "lôi lam thanh long"),
    "gold": ("qi_gold", (255, 220, 80), "_preview_loi_vang.gif", "lôi vàng điện"),
    "venom": ("qi_venom", (80, 255, 120), "_preview_loi_doc.gif", "độc lôi"),
    "gale": ("qi_gale", (100, 255, 220), "_preview_loi_phong.gif", "phong lôi"),
}

STEMS = ("strike", "impact", "charge", "flight")


def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def recolor_rgba(im: Image.Image, accent: tuple[int, int, int]) -> Image.Image:
    """
    Giữ luminance + alpha của crimson; map hue sang accent (hoa_long-style tint).
    Core sáng (gần trắng) giữ; mid/low → accent.
    """
    ar, ag, ab = [c / 255.0 for c in accent]
    ah, asat, _ = colorsys.rgb_to_hsv(ar, ag, ab)
    px = im.load()
    w, h = im.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            # luminance của pixel nguồn
            lum = max(r, g, b) / 255.0
            # trắng nóng giữ; còn lại nhuộm accent
            if lum > 0.88:
                # core — hơi nghiêng accent
                nr = int(255 * clamp01(0.92 + ar * 0.08))
                ng = int(255 * clamp01(0.88 + ag * 0.1))
                nb = int(255 * clamp01(0.82 + ab * 0.12))
            else:
                # sat theo độ đậm nguồn (crimson có sat cao ở viền)
                src_h, src_s, src_v = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
                sat = clamp01(asat * (0.55 + 0.55 * src_s) * (1.15 - lum * 0.35))
                val = clamp01(src_v * 1.05)
                rr, gg, bb = colorsys.hsv_to_rgb(ah, sat, val)
                nr, ng, nb = int(rr * 255), int(gg * 255), int(bb * 255)
            op[x, y] = (nr, ng, nb, a)
    return ImageEnhance.Contrast(out).enhance(1.06)


def preview_gif(frames: list[Image.Image], path: Path, duration_ms: int = 55) -> None:
    if not frames:
        return
    frames[0].save(
        path,
        save_all=True,
        append_images=frames[1:],
        duration=duration_ms,
        loop=0,
        disposal=2,
    )


def contact_sheet(frames: list[Image.Image], path: Path, picks=(1, 6, 12, 18, 24)) -> None:
    picks = [p for p in picks if 1 <= p <= len(frames)]
    if not picks:
        return
    w, h = frames[0].size
    sheet = Image.new("RGBA", (w * len(picks), h), (0, 0, 0, 255))
    for i, idx in enumerate(picks):
        sheet.paste(frames[idx - 1], (i * w, 0))
    sheet.save(path)


def gen_pack(tag: str) -> None:
    folder, accent, preview_name, label = PACKS[tag]
    dest = LOI / folder
    if not SRC.exists():
        raise SystemExit(f"missing source pack: {SRC}")
    dest.mkdir(parents=True, exist_ok=True)

    strike_frames: list[Image.Image] = []
    for stem in STEMS:
        srcs = sorted(SRC.glob(f"{stem}_*.png"))
        if not srcs:
            continue
        for sp in srcs:
            im = Image.open(sp).convert("RGBA")
            out = recolor_rgba(im, accent)
            out.save(dest / sp.name)
            if stem == "strike":
                strike_frames.append(out)

    # refs
    ref = SRC / "_ref_crimson_strike.png"
    if ref.exists():
        recolor_rgba(Image.open(ref).convert("RGBA"), accent).save(dest / f"_ref_{tag}_strike.png")

    if strike_frames:
        preview_gif(strike_frames, dest / preview_name)
        contact_sheet(strike_frames, dest / preview_name.replace(".gif", "_contact.png"))

    (dest / "README.md").write_text(
        f"# {folder} — {label}\n\nRecolor từ `qi_crimson`. Preview: `{preview_name}`\n",
        encoding="utf-8",
    )
    print(f"ok {folder} ×{len(strike_frames)} strike → {preview_name}")


def main() -> None:
    wanted = [a.lower() for a in sys.argv[1:] if a.lower() in PACKS] or list(PACKS.keys())
    for tag in wanted:
        gen_pack(tag)


if __name__ == "__main__":
    main()
