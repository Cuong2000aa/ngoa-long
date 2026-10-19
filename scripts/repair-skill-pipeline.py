#!/usr/bin/env python3
"""
Repair toàn bộ pipeline chiêu:
1) effects từ desc (NAME_MAP + catalog) — bỏ false heal sĩ khí→máu
2) pattern + hits
3) motif/flash (FLASH_MAP)
4) ghi combatProfiles vào status-effects.json

Chạy: python3 scripts/repair-skill-pipeline.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from lib_skill_semantics import (  # noqa: E402
    brackets,
    build_combat_profiles,
    build_full_name_map,
    effects_from_desc,
    infer_motif_flash,
    infer_pattern,
    load_wiki_catalog,
    parse_hits,
    SKIP_BRACKETS,
)

SKILLS = ROOT / "data" / "skills.json"
STATUS = ROOT / "data" / "status-effects.json"


def main() -> None:
    catalog = load_wiki_catalog()
    name_map = build_full_name_map(catalog)
    profiles = build_combat_profiles(catalog)

    skills_data = json.loads(SKILLS.read_text(encoding="utf-8"))
    skills = skills_data["skills"]

    stats = {
        "effects_rewritten": 0,
        "false_heal_removed": 0,
        "pattern_changed": 0,
        "hits_set": 0,
        "motif_changed": 0,
        "unmapped_brackets": {},
    }
    unmapped: dict[str, int] = {}

    for sk in skills.values():
        desc = sk.get("desc") or ""
        name = sk.get("name") or ""

        # —— effects ——
        old_eff = sk.get("effects") if isinstance(sk.get("effects"), list) else []
        old_had_false_heal = any(
            e.get("type") == "heal_pct"
            and "trị liệu" not in desc.lower()
            and "hồi" in desc.lower()
            and "sĩ khí" in desc.lower()
            for e in old_eff
            if isinstance(e, dict)
        )
        new_eff = effects_from_desc(desc, name_map)
        if json.dumps(new_eff, ensure_ascii=False, sort_keys=True) != json.dumps(
            old_eff, ensure_ascii=False, sort_keys=True
        ):
            sk["effects"] = new_eff
            stats["effects_rewritten"] += 1
        elif not new_eff and "effects" in sk:
            # giữ rỗng có chủ đích
            sk["effects"] = []
            stats["effects_rewritten"] += 1
        if old_had_false_heal and not any(e.get("type") == "heal_pct" for e in new_eff):
            stats["false_heal_removed"] += 1

        for raw in brackets(desc):
            key = raw.strip().lower()
            if key in SKIP_BRACKETS or key in name_map:
                continue
            if len(key) > 40:
                continue
            unmapped[raw] = unmapped.get(raw, 0) + 1

        # —— pattern / hits ——
        new_pat = infer_pattern(desc)
        if sk.get("pattern") != new_pat:
            sk["pattern"] = new_pat
            stats["pattern_changed"] += 1
        hits = parse_hits(desc)
        if sk.get("hits") != hits:
            sk["hits"] = hits
            stats["hits_set"] += 1

        # —— motif / flash ——
        motif, flash = infer_motif_flash(name, desc, new_pat)
        fx = dict(sk.get("fx") or {})
        changed = False
        if fx.get("motif") != motif:
            fx["motif"] = motif
            changed = True
        if fx.get("flash") != flash:
            fx["flash"] = flash
            changed = True
        if not fx.get("text"):
            fx["text"] = (name or "").upper()[:18]
            changed = True
        if changed:
            sk["fx"] = fx
            stats["motif_changed"] += 1

    stats["unmapped_brackets"] = dict(
        sorted(unmapped.items(), key=lambda x: -x[1])[:25]
    )

    SKILLS.write_text(
        json.dumps(skills_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    # —— combatProfiles ——
    status = json.loads(STATUS.read_text(encoding="utf-8"))
    status["combatProfiles"] = profiles
    status["note"] = (
        "effects = map engine combat; wikiCatalog = snapshot tên wiki; "
        "combatProfiles = hệ số atk/def cho wiki_buff/debuff (fan remake)."
    )
    STATUS.write_text(json.dumps(status, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("=== repair-skill-pipeline ===")
    for k, v in stats.items():
        if k != "unmapped_brackets":
            print(f"  {k}: {v}")
    print(f"  combatProfiles: {len(profiles)}")
    print(f"  name_map size: {len(name_map)}")
    print("  top still-unmapped:")
    for name, n in list(stats["unmapped_brackets"].items())[:12]:
        print(f"    {n:3d}  [{name}]")


if __name__ == "__main__":
    main()
