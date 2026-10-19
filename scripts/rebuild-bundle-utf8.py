# -*- coding: utf-8 -*-
"""Pack data/*.json into js/db/nl-db.bundle.js with UTF-8 (no mojibake)."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    ("_meta", "meta"),
    ("qualities", "qualities"),
    ("troops", "troops"),
    ("formation", "formation"),
    ("formations", "formations"),
    ("formulas", "formulas"),
    ("factions", "factions"),
    ("skills", "skills"),
    ("generals", "generals"),
    ("recruit", "recruit"),
    ("items", "items"),
    ("buildings", "buildings"),
    ("campaign", "campaign"),
    ("arena", "arena"),
    ("progression", "progression"),
    ("status-effects", "statusEffects"),
]


def main() -> None:
    parts = []
    for fname, key in FILES:
        text = (ROOT / "data" / f"{fname}.json").read_text(encoding="utf-8")
        if text.startswith("\ufeff"):
            text = text[1:]
        parts.append(f'"{key}": {text.rstrip()}')
    header = (
        "// Auto-generated offline DB bundle v2\n"
        "// Source: /data/*.json\n"
        "// Rebuild: py -3 scripts/rebuild-bundle-utf8.py\n"
    )
    body = "(function(g){g.NL_DB={" + ",\n".join(parts) + "};})(window);\n"
    out = ROOT / "js" / "db" / "nl-db.bundle.js"
    out.write_text(header + body, encoding="utf-8")
    sample = out.read_text(encoding="utf-8")
    assert "Lưu Bị" in sample
    assert "Hiệu Úy I" in sample
    assert "stageLinks" in sample
    print("OK bundle bytes", out.stat().st_size)


if __name__ == "__main__":
    main()
