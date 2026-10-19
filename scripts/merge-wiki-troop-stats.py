# -*- coding: utf-8 -*-
"""Gắn chỉ số / tên bậc wiki (player only) vào data/troops.json."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
troops_path = DATA / "troops.json"
wiki_path = DATA / "troops-wiki.json"

troops = json.loads(troops_path.read_text(encoding="utf-8"))
wiki = json.loads(wiki_path.read_text(encoding="utf-8"))

type_bias = wiki.get("typeStatBias") or {}
tier_names = wiki.get("tierNames") or {}
player = wiki.get("playerByTroopTier") or {}

# Ưu tiên tên bậc từ art tier-map (đã loại NPC) nếu có
tier_map_path = ROOT / "assets" / "units" / "battle" / "tier-map.json"
if tier_map_path.exists():
    tier_map = json.loads(tier_map_path.read_text(encoding="utf-8"))
    for troop_id, tiers in tier_map.items():
        names = []
        for t in range(1, 7):
            info = tiers.get(str(t)) or {}
            names.append(info.get("wikiName") or (tier_names.get(troop_id) or [None] * 6)[t - 1] or f"Bậc {t}")
        tier_names[troop_id] = names

# Soft-clamp bias về khoảng hợp lý cho combat
def clamp_bias(b: dict) -> dict:
    out = {}
    for k in ("vuLuc", "tongLinh", "triLuc"):
        v = float(b.get(k, 1.0))
        out[k] = round(min(1.25, max(0.75, v)), 3)
    return out


# Blend nhẹ với bias cũ để không phá balance đột ngột
def blend(old: dict, new: dict, w: float = 0.55) -> dict:
    keys = ("vuLuc", "tongLinh", "triLuc")
    out = {}
    for k in keys:
        o = float((old or {}).get(k, 1.0))
        n = float((new or {}).get(k, 1.0))
        out[k] = round(o * (1 - w) + n * w, 3)
    return clamp_bias(out)


types = troops.setdefault("types", {})
for troop_id, tinfo in types.items():
    wiki_bias = type_bias.get(troop_id)
    if wiki_bias:
        tinfo["statBias"] = blend(tinfo.get("statBias") or {}, wiki_bias, 0.55)
        tinfo["wikiStatBias"] = wiki_bias

    names = tier_names.get(troop_id)
    if names and len(names) >= 6:
        tinfo["tierNames"] = names[:6]
        tinfo["wikiTierNames"] = names[:6]

    # Mô tả bậc từ unit đại diện (player)
    tier_descs = {}
    for tier, info in (player.get(troop_id) or {}).items():
        if info.get("desc"):
            tier_descs[tier] = {
                "name": info.get("name"),
                "desc": info.get("desc"),
                "statTags": info.get("statTags") or [],
                "statBias": info.get("statBias"),
            }
    if tier_descs:
        tinfo["wikiTiers"] = tier_descs

    # Desc loại từ bậc 1 nếu có
    t1 = (player.get(troop_id) or {}).get("1")
    if t1 and t1.get("desc"):
        tinfo["wikiDesc"] = t1["desc"]

troops["schemaVersion"] = max(int(troops.get("schemaVersion") or 5), 6)
troops["wikiSource"] = wiki.get("source")
troops["wikiNote"] = "Chỉ số/tên bậc lấy từ wiki player units; NPC không đưa vào types."

troops_path.write_text(json.dumps(troops, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("merged into", troops_path)
for tid, t in types.items():
    print(tid, "bias", t.get("statBias"), "tiers", t.get("tierNames"))
