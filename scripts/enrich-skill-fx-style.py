#!/usr/bin/env python3
"""Gắn fx.style theo pattern+motif — metadata cho QA / renderer."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / "data" / "skills.json"


def style_of(pattern: str, motif: str) -> str:
    pat = (pattern or "single").lower()
    mot = (motif or "slash").lower()
    if mot == "shield" or pat == "self":
        return "barrier"
    if pat == "ally_all" or mot in ("heal", "buff"):
        return "ally_aura"
    if mot == "charge":
        return "cavalry_charge"
    if mot == "rush":
        return "rush_assault"
    if pat == "column":
        return "column_pierce"
    if pat in ("row", "front_row"):
        return "row_sweep"
    if pat == "all":
        return "aoe_nova"
    if mot in ("tiger", "wolf", "dragon"):
        return f"beast_{mot}"
    if mot in ("fire", "thunder", "water", "poison", "snake", "whirlwind", "bagua"):
        return f"element_{mot}"
    return "single_strike"


def main() -> None:
    data = json.loads(SKILLS.read_text(encoding="utf-8"))
    n = 0
    for sk in data["skills"].values():
        fx = dict(sk.get("fx") or {})
        style = style_of(sk.get("pattern") or "single", fx.get("motif") or "")
        if fx.get("style") != style:
            fx["style"] = style
            sk["fx"] = fx
            n += 1
    SKILLS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"fx.style updated: {n}")


if __name__ == "__main__":
    main()
