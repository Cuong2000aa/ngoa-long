#!/usr/bin/env python3
"""Unpack itch.io VFX zips → assets/fx/itch/{name}/ (PNG/WebP only).

Usage:
  mkdir -p _dl/itch-fx/drop
  # drop downloaded .zip files there
  python3 scripts/import-itch-vfx.py
"""
from __future__ import annotations

import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DROP = ROOT / "_dl" / "itch-fx" / "drop"
OUT = ROOT / "assets" / "fx" / "itch"
CREDITS = ROOT / "assets" / "CREDITS.md"
IMG_EXT = {".png", ".webp", ".jpg", ".jpeg"}


def slug(name: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9._-]+", "-", name).strip("-").lower()
    return s[:64] or "pack"


def main() -> None:
    DROP.mkdir(parents=True, exist_ok=True)
    zips = sorted(DROP.glob("*.zip"))
    if not zips:
        print(f"No zip in {DROP}")
        print("Download itch packs manually, then re-run.")
        return

    OUT.mkdir(parents=True, exist_ok=True)
    imported: list[str] = []
    for zpath in zips:
        name = slug(zpath.stem)
        dest = OUT / name
        if dest.exists():
            shutil.rmtree(dest)
        dest.mkdir(parents=True)
        n = 0
        with zipfile.ZipFile(zpath, "r") as zf:
            for info in zf.infolist():
                if info.is_dir():
                    continue
                p = Path(info.filename)
                if p.suffix.lower() not in IMG_EXT:
                    continue
                # skip tiny icons / macOS junk
                if "__MACOSX" in p.parts or p.name.startswith("."):
                    continue
                if info.file_size < 800:
                    continue
                out_name = f"{n:03d}_{p.name}"
                data = zf.read(info)
                (dest / out_name).write_bytes(data)
                n += 1
        print(f"OK {zpath.name} → assets/fx/itch/{name}/ ({n} images)")
        if n:
            imported.append(f"- **{name}** — itch.io drop `{zpath.name}` → `assets/fx/itch/{name}/` ({n} frames)")

    if imported and CREDITS.exists():
        block = "\n".join(imported)
        text = CREDITS.read_text(encoding="utf-8")
        marker = "## itch.io VFX drops"
        section = f"{marker}\n{block}\n"
        if marker in text:
            # replace existing section until next ##
            text = re.sub(
                rf"{re.escape(marker)}.*?(?=\n## |\Z)",
                section + "\n",
                text,
                flags=re.S,
            )
        else:
            text = text.rstrip() + "\n\n" + section + "\n"
        CREDITS.write_text(text, encoding="utf-8")
        print("Updated assets/CREDITS.md")


if __name__ == "__main__":
    main()
