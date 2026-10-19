#!/usr/bin/env python3
"""
Đọc mô tả kỹ năng (tag [Hiệu Ứng] wiki) → ghi/merge `effects[]` vào skills.json.

Ưu tiên: python3 scripts/repair-skill-pipeline.py (full: effects+pattern+motif+profiles).
Script này giữ tương thích — dùng lib_skill_semantics chung.

Chạy: python3 scripts/sync-skill-effects-from-desc.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from lib_skill_semantics import (  # noqa: E402
    brackets,
    build_full_name_map,
    effects_from_desc,
    SKIP_BRACKETS,
)

SKILLS_PATH = ROOT / "data" / "skills.json"


def main() -> None:
    name_map = build_full_name_map()
    data = json.loads(SKILLS_PATH.read_text(encoding="utf-8"))
    skills = data["skills"]
    updated = 0
    uncovered: dict[str, int] = {}

    for sk in skills.values():
        desc = sk.get("desc") or ""
        inferred = effects_from_desc(desc, name_map)
        for raw in brackets(desc):
            key = raw.strip().lower()
            if key not in SKIP_BRACKETS and key not in name_map and len(key) < 40:
                uncovered[raw] = uncovered.get(raw, 0) + 1
        old = sk.get("effects") if isinstance(sk.get("effects"), list) else []
        if json.dumps(inferred, ensure_ascii=False, sort_keys=True) != json.dumps(
            old, ensure_ascii=False, sort_keys=True
        ):
            sk["effects"] = inferred
            updated += 1

    SKILLS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"skills effects rewritten: {updated}")
    print("top unmapped [brackets]:")
    for name, n in sorted(uncovered.items(), key=lambda x: -x[1])[:20]:
        print(f"  {n:4d}  [{name}]")


if __name__ == "__main__":
    main()
