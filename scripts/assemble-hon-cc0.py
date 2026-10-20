#!/usr/bin/env python3
"""
Assemble Hồn packs from real CC0 creature/effect sprites (NOT procedural blobs).

Sources (see assets/CREDITS.md):
  - GreatDog_ARt — 3 Dragon Animation Pack (CC0)
  - Master484 — Dragon 1 head sheet (CC0)
  - Blooming Pixels — Snake Sprite Sheet (CC0)
  - Shepardskin — Snake RPG Character (CC0)
  - Segel2D — Wolf Game Character (CC0) / assets/fx/wolf
  - Micket LPC tiger_wip3 (CC0)
  - Cethiel water / n4 whirlwind / Starsteel thunder / SpritePilot tiger claw
  - Kenney particles for mist/orb/sparkle soft layers

Prereq: run download into _dl/hon-cc0 (see script header comments) OR files already present.

Usage: python3 scripts/assemble-hon-cc0.py
"""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps, ImageSequence

ROOT = Path(__file__).resolve().parents[1]
DL = ROOT / "_dl" / "hon-cc0"
FX = ROOT / "assets" / "fx"
OUT_SIZE = 256

DRAGON_ROOT = (
    DL
    / "unpack"
    / "dragons"
    / "Dragon Pack - INCLUDES 3 ANIMATED DRAGONS!"
    / "Dragon 1 Animations"
)


def ensure_rgba(im: Image.Image) -> Image.Image:
    if im.mode != "RGBA":
        return im.convert("RGBA")
    return im


def fit_canvas(im: Image.Image, size: int = OUT_SIZE, pad: float = 0.08) -> Image.Image:
    """Crop to alpha bbox, fit into square transparent canvas."""
    im = ensure_rgba(im)
    alpha = im.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cropped = im.crop(bbox)
    max_side = max(cropped.size)
    target = int(size * (1 - pad * 2))
    scale = target / max_side
    nw = max(1, int(cropped.size[0] * scale))
    nh = max(1, int(cropped.size[1] * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
    return canvas


def face_right(im: Image.Image) -> Image.Image:
    """Heuristic: if opaque mass is heavier on left, flip so head/nose tends right."""
    im = ensure_rgba(im)
    a = im.split()[-1]
    w, h = im.size
    left = sum(a.getpixel((x, y)) for x in range(w // 3) for y in range(0, h, 4))
    right = sum(a.getpixel((x, y)) for x in range(2 * w // 3, w) for y in range(0, h, 4))
    if left > right * 1.15:
        return ImageOps.mirror(im)
    return im


def write_seq(out_dir: Path, prefix: str, frames: list[Image.Image], n: int) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    if not frames:
        raise SystemExit(f"no frames for {out_dir}/{prefix}")
    for i in range(n):
        fr = frames[i % len(frames)]
        fr.save(out_dir / f"{prefix}_{i + 1:02d}.png")


def copy_soft_fx(out_dir: Path, mist_srcs: list[Path], spark_srcs: list[Path], orb_src: Path | None) -> None:
    """Mist / sparkle / orb / ring / crescent from existing CC0 soft FX (not creature)."""
    particles = FX / "particles"
    mist_list = [p for p in mist_srcs if p.exists()]
    if not mist_list:
        mist_list = sorted(particles.glob("*smoke*.png"))[:4] or sorted(particles.glob("*.png"))[:4]
    frames = [fit_canvas(Image.open(p)) for p in mist_list[:4]]
    while len(frames) < 4:
        frames.append(frames[-1] if frames else Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0)))
    write_seq(out_dir, "mist", frames, 4)

    spark_list = [p for p in spark_srcs if p.exists()]
    if not spark_list:
        spark_list = sorted(particles.glob("*star*.png"))[:4] or sorted(particles.glob("*flare*.png"))[:4]
    sframes = [fit_canvas(Image.open(p)) for p in spark_list[:4]]
    while len(sframes) < 4:
        sframes.append(sframes[-1] if sframes else Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0)))
    write_seq(out_dir, "sparkle", sframes, 4)

    if orb_src and orb_src.exists():
        fit_canvas(Image.open(orb_src)).save(out_dir / "orb.png")
    elif particles.exists():
        cands = sorted(particles.glob("*circle*.png")) or sorted(particles.glob("*.png"))
        fit_canvas(Image.open(cands[0])).save(out_dir / "orb.png")

    # ring / crescent — reuse mist softly brightened
    ring_frames = []
    for i, fr in enumerate(frames):
        bright = ImageEnhance.Brightness(fr).enhance(1.2)
        ring_frames.append(bright)
    write_seq(out_dir, "ring", ring_frames, 4)
    write_seq(out_dir, "crescent", ring_frames[:3], 3)


def load_dragon_frames() -> list[Image.Image]:
    paths = []
    for sub in ("Fly loop", "Attack", "Idle loop"):
        d = DRAGON_ROOT / sub
        if d.is_dir():
            paths.extend(sorted(p for p in d.glob("*.png") if not p.name.startswith("._")))
    # Master484 head frames (top strip of sheet) as extra
    m484 = DL / "m484.png"
    extras = []
    if m484.exists():
        sheet = ensure_rgba(Image.open(m484))
        # sheet has multiple parts; take left region heads ~4 frames if grid-like
        w, h = sheet.size
        # crop upper band into 4 cells
        cell_w = w // 4
        for i in range(4):
            cell = sheet.crop((i * cell_w, 0, (i + 1) * cell_w, h // 2))
            extras.append(cell)
    frames = [face_right(fit_canvas(Image.open(p))) for p in paths]
    frames.extend(face_right(fit_canvas(e)) for e in extras)
    # Prefer fly/attack first: already ordered
    return frames[:8] if len(frames) >= 8 else frames


def load_snake_frames() -> list[Image.Image]:
    frames: list[Image.Image] = []
    sheet = DL / "snake_sheet.png"
    if sheet.exists():
        im = ensure_rgba(Image.open(sheet))
        # 126x126 — likely 3x3 of 42
        cw, ch = 42, 42
        for row in range(3):
            for col in range(3):
                cell = im.crop((col * cw, row * ch, (col + 1) * cw, (row + 1) * ch))
                if cell.split()[-1].getbbox():
                    frames.append(face_right(fit_canvas(cell)))
    # GIF walk side frames
    gif = DL / "unpack" / "snake" / "snake" / "snake_walk_sidex3.gif"
    if gif.exists():
        g = Image.open(gif)
        for fr in ImageSequence.Iterator(g):
            frames.append(face_right(fit_canvas(fr.convert("RGBA"))))
    return frames[:8] if frames else frames


def load_tiger_frames() -> list[Image.Image]:
    # SpritePilot combat FX (CC0) — claw/roar/slam rõ motif hổ (không dùng tiger_wip3 mesh preview)
    frames: list[Image.Image] = []
    for pat in ("roar_*.png", "claw_*.png", "slam_*.png", "crit_*.png"):
        for p in sorted((FX / "tiger").glob(pat)):
            frames.append(fit_canvas(Image.open(p)))
    return frames[:8] if frames else frames


def load_wolf_frames() -> list[Image.Image]:
    frames: list[Image.Image] = []
    # Repo already has sliced Segel2D wolf
    for p in sorted((FX / "wolf").glob("wolf_*.png")):
        frames.append(face_right(fit_canvas(Image.open(p))))
    sheet = DL / "wolf_sheet.png"
    if sheet.exists() and len(frames) < 4:
        im = ensure_rgba(Image.open(sheet))
        # 500x500 sheet — try 4x4 grid
        n = 4
        cw, ch = im.size[0] // n, im.size[1] // n
        for row in range(n):
            for col in range(n):
                cell = im.crop((col * cw, row * ch, (col + 1) * cw, (row + 1) * ch))
                if cell.split()[-1].getbbox():
                    frames.append(face_right(fit_canvas(cell)))
    return frames[:8] if frames else frames


def load_named_fx(folder: Path, glob_pat: str, n: int = 8) -> list[Image.Image]:
    paths = sorted(folder.glob(glob_pat))[:n]
    return [fit_canvas(Image.open(p)) for p in paths]


def build_pack(pack_id: str, serpent: list[Image.Image], mist_srcs: list[Path], spark_srcs: list[Path], orb: Path | None) -> None:
    out = FX / pack_id
    if out.exists():
        # keep folder, overwrite frames
        pass
    print(f"→ {pack_id}  serpent×{len(serpent)}")
    if len(serpent) < 2:
        raise SystemExit(f"{pack_id}: need creature frames, got {len(serpent)}")
    write_seq(out, "serpent", serpent, 8)
    copy_soft_fx(out, mist_srcs, spark_srcs, orb)
    (out / "README.md").write_text(
        f"# {pack_id}\n\nAssembled from CC0 creature sprites via `scripts/assemble-hon-cc0.py`.\n"
        f"See `assets/CREDITS.md` + `assets/fx/HON_PACKS.md`.\n",
        encoding="utf-8",
    )


def main() -> None:
    if not DRAGON_ROOT.is_dir():
        raise SystemExit(
            "Missing GreatDog dragon unpack. Download dragon_pack_0.zip into _dl/hon-cc0 and unzip first."
        )

    particles = FX / "particles"
    fire_wrath = list((FX / "fire-wrath").glob("*.png"))
    water = list((FX / "water").glob("01_water__*.png"))
    whirl = list((FX / "whirlwind").glob("*.png"))
    star = FX / "skill" / "starsteel"

    build_pack(
        "hon_rong",
        load_dragon_frames(),
        mist_srcs=fire_wrath[:4],
        spark_srcs=list(particles.glob("*flare*.png"))[:4] or fire_wrath[:4],
        orb=next(iter(particles.glob("*circle*.png")), None),
    )
    # also refresh legacy gold aliases used by old paths
    hon = FX / "hon_rong"
    for i in range(1, 9):
        src = hon / f"serpent_{i:02d}.png"
        if src.exists():
            shutil.copy2(src, FX / "hon_rong" / f"serpent_gold_{i:02d}.png")
    for i in range(1, 7):
        src = hon / f"serpent_{i:02d}.png"
        if src.exists():
            shutil.copy2(src, FX / "hon_rong" / f"serpent_blue_{i:02d}.png")

    build_pack(
        "hon_xa",
        load_snake_frames(),
        mist_srcs=list((FX / "arcane").glob("*.png"))[:4] or water[:4],
        spark_srcs=list(particles.glob("*star*.png"))[:4],
        orb=next(iter(particles.glob("*circle*.png")), None),
    )
    build_pack(
        "hon_ho",
        load_tiger_frames(),
        mist_srcs=list((FX / "tiger").glob("roar_*.png"))[:4] or fire_wrath[:4],
        spark_srcs=list((FX / "tiger").glob("claw_*.png"))[:4],
        orb=next(iter(particles.glob("*circle*.png")), None),
    )
    build_pack(
        "hon_soi",
        load_wolf_frames(),
        mist_srcs=list((FX / "blood").glob("*.png"))[:4] or fire_wrath[:4],
        spark_srcs=list(particles.glob("*star*.png"))[:4],
        orb=next(iter(particles.glob("*circle*.png")), None),
    )
    build_pack(
        "hon_thuy",
        load_named_fx(FX / "water", "01_water__*.png", 8) or load_named_fx(FX / "water", "*.png", 8),
        mist_srcs=water[:4],
        spark_srcs=list(particles.glob("*star*.png"))[:4],
        orb=next(iter((FX / "water").glob("*.png")), None),
    )
    thun = sorted(star.glob("Thundersphere*.png")) if star.is_dir() else []
    if not thun:
        thun = sorted(star.glob("Thunder*.png")) if star.is_dir() else []
    build_pack(
        "hon_loi",
        [fit_canvas(Image.open(p)) for p in thun] or load_named_fx(FX / "arcane", "*.png", 8),
        mist_srcs=list((FX / "pure").glob("*.png"))[:4] or list(particles.glob("*.png"))[:4],
        spark_srcs=list(particles.glob("*star*.png"))[:4],
        orb=thun[0] if thun else None,
    )
    build_pack(
        "hon_phong",
        load_named_fx(FX / "whirlwind", "*.png", 8) or [fit_canvas(Image.open(p)) for p in whirl],
        mist_srcs=whirl[:4] or list(particles.glob("*.png"))[:4],
        spark_srcs=list(particles.glob("*star*.png"))[:4],
        orb=whirl[0] if whirl else None,
    )

    (FX / "HON_PACKS.md").write_text(
        """# Hồn spirit packs (CC0 creatures)

Assembled by `python3 scripts/assemble-hon-cc0.py` — **real animal/effect sprites**, not procedural blobs.

| Folder | Creature / look | Source |
|--------|-----------------|--------|
| `hon_rong/` | Rồng bay/đánh | GreatDog_ARt Dragon Pack + Master484 head (CC0) |
| `hon_xa/` | Rắn | Blooming Pixels snake sheet + Shepardskin walk (CC0) |
| `hon_ho/` | Hổ / móng | LPC tiger_wip3 + SpritePilot claw/roar (CC0) |
| `hon_soi/` | Sói | Segel2D Wolf (CC0) |
| `hon_thuy/` | Sóng thủy | Cethiel Water (CC0) |
| `hon_loi/` | Lôi cầu | Starsteel Thundersphere (CC0) |
| `hon_phong/` | Lốc | n4 Whirlwind (CC0) |

Mist/orb/sparkle soft layers: Kenney Particle Pack + Cethiel overlays.

Do **not** use `npm run gen:hon-packs` for creature silhouettes.
""",
        encoding="utf-8",
    )
    print("Done — CC0 hon packs ready under assets/fx/hon_*")


if __name__ == "__main__":
    main()
