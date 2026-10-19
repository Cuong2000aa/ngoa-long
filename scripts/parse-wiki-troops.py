# -*- coding: utf-8 -*-
"""
Parse wiki binh chủng (page.html):
- Tách NPC (span data-nlw-npc-nhan) vs binh tướng người chơi
- Lấy loại / cấp / mô tả → tag chỉ số + statBias phát triển
Xuất data/troops-wiki.json (+ copy assets/units/wiki/)
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DL = ROOT / "_dl" / "wiki-binh"
OUT_DATA = ROOT / "data"
OUT_WIKI = ROOT / "assets" / "units" / "wiki"
OUT_DATA.mkdir(parents=True, exist_ok=True)

html = (DL / "page.html").read_text(encoding="utf-8", errors="ignore")
manifest = {m["url"]: m["file"] for m in json.loads((OUT_WIKI / "manifest.json").read_text(encoding="utf-8"))}

LOAI_MAP = {
    "bo-binh": "infantry",
    "thuong-binh": "spear",
    "ky-binh": "cavalry",
    "cung-binh": "archer",
    "quan-van": "strategist",
    # thuyền / thuyền chiến — map tạm sang archer (đánh xa) nếu cần
    "thuyen-nho": "archer",
    "thuyen-vua": "archer",
    "thuyen-lon": "archer",
}

TAG_RULES = [
    (r"vật công|đánh thường|tấn công ưu|chú trọng tấn công|công cực cao", "physAtk"),
    (r"vật phòng|phòng thủ|chú trọng phòng thủ|thủ cực cao|phòng thủ cao|phòng thủ kém", "physDef"),
    (r"pháp công", "magicAtk"),
    (r"pháp phòng", "magicDef"),
    (r"mưu công|kế sách", "stratAtk"),
    (r"mưu phòng", "stratDef"),
    (r"bạo kích|\bbạo\b|bạo cao", "crit"),
    (r"phản kích|phản công|phản đòn", "counter"),
    (r"công cực cao|tấn công ưu", "atkFocus"),
    (r"thủ cực cao|phòng thủ ưu|chú trọng phòng thủ", "defFocus"),
    (r"năng lực tổng hợp", "balanced"),
    (r"không sợ.*kế sách|không sợ sát thương kế", "resistStrat"),
    (r"khắc chế thương|khắc thương", "beatsSpear"),
    (r"khắc chế bộ|khắc bộ", "beatsInfantry"),
    (r"khắc chế kỵ|khắc kỵ", "beatsCavalry"),
    (r"bị kỵ|uy hiếp.*kỵ", "weakToCavalry"),
    (r"bị bộ|uy hiếp.*bộ", "weakToInfantry"),
    (r"bị thương|uy hiếp.*thương", "weakToSpear"),
]


def wiki_cap_to_tier(cap: int) -> int:
    if cap <= 1:
        return 1
    if cap >= 6:
        return 6
    return cap


def bias_from_tags(tags: list[str]) -> dict:
    bias = {"vuLuc": 1.0, "tongLinh": 1.0, "triLuc": 1.0}
    if "atkFocus" in tags or "physAtk" in tags or "crit" in tags:
        bias["vuLuc"] = 1.12
    if "defFocus" in tags or "physDef" in tags or "counter" in tags:
        bias["tongLinh"] = 1.12
    if "stratAtk" in tags or "magicAtk" in tags or "stratDef" in tags:
        bias["triLuc"] = 1.15
    if "balanced" in tags:
        bias = {"vuLuc": 1.05, "tongLinh": 1.05, "triLuc": 1.05}
    if "resistStrat" in tags:
        bias["triLuc"] = max(bias["triLuc"], 1.08)
    return bias


def slug(name: str) -> str:
    return re.sub(r"[^\w]+", "_", name, flags=re.UNICODE).strip("_").lower()[:48] or "unit"


# Cap markers: data-nlw-cap="N" (chính xác hơn chữ "Cấp N")
cap_marks = [(m.start(), int(m.group(1))) for m in re.finditer(r'data-nlw-cap="(\d+)"', html)]


def cap_at(pos: int) -> int:
    cur = 0
    for p, c in cap_marks:
        if p > pos:
            break
        cur = c
    return cur


opens = list(re.finditer(r'<button([^>]*data-nlw-unit="(\d+)"[^>]*)>', html, re.I))
cards: list[dict] = []

for i, o in enumerate(opens):
    start = o.start()
    end = opens[i + 1].start() if i + 1 < len(opens) else min(start + 2200, len(html))
    block = html[start:end]
    attrs = o.group(1)
    uid = o.group(2)
    loai_m = re.search(r'data-nlw-loai="([^"]+)"', attrs)
    loai = loai_m.group(1) if loai_m else ""
    troop = LOAI_MAP.get(loai, "infantry")
    # skip thuyền variants from main 5-troop catalog (vẫn giữ trong allUnits)
    is_boat = loai.startswith("thuyen")

    is_npc = "data-nlw-npc-nhan" in block
    alt = re.search(r'alt="([^"]+)"', block)
    ten = re.search(r'data-nlw-ten[^>]*>([^<]+)', block)
    name = (ten.group(1) if ten else alt.group(1) if alt else f"unit-{uid}").strip()
    url_m = re.search(
        r'src="(https://cdn-mainsite-aka\.vnggames\.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/[^"]+)"',
        block,
    )
    url = url_m.group(1) if url_m else None
    desc_m = re.search(r"<p[^>]*>([\s\S]*?)</p>", block)
    desc = re.sub(r"<[^>]+>", "", desc_m.group(1) if desc_m else "").strip()
    desc = re.sub(r"\s+", " ", desc)
    if desc.upper() == "NPC":
        desc = ""
        is_npc = True

    cap = cap_at(start)
    tier = wiki_cap_to_tier(cap)
    if "hổ báo kỵ" in name.lower():
        troop = "cavalry"
        tier = 5

    tags: list[str] = []
    for pat, tag in TAG_RULES:
        if re.search(pat, desc, re.I) and tag not in tags:
            tags.append(tag)

    cards.append(
        {
            "id": slug(name),
            "wikiId": int(uid),
            "name": name,
            "loai": loai,
            "troop": troop,
            "boat": is_boat,
            "wikiCap": cap,
            "tier": tier,
            "npc": is_npc,
            "desc": desc[:320],
            "iconUrl": url,
            "iconFile": manifest.get(url) if url else None,
            "statTags": tags,
            "statBias": bias_from_tags(tags),
        }
    )

# Deduplicate by (name, npc) — keep first occurrence (đúng cấp section)
seen: set[tuple] = set()
units: list[dict] = []
for c in cards:
    key = (c["name"], c["npc"], c["loai"])
    if key in seen:
        continue
    seen.add(key)
    units.append(c)

# Name xuất hiện cả NPC + player (cùng skin): giữ flag theo bản ghi; art tướng chỉ lấy !npc
player = [u for u in units if not u["npc"] and not u["boat"]]
npc = [u for u in units if u["npc"]]
print("cards", len(cards), "unique", len(units), "player", len(player), "npc", len(npc))

# Catalog theo troop × tier — ưu tiên tên base (Bộ/Thương/Kỵ/…) không lấy hero/NPC-skin
SIMPLE = {
    "infantry": ["bộ", "thuẫn binh", "trùng bộ", "giáp bộ", "đao binh"],
    "spear": ["thương", "trùng thương", "kích", "ngân thương"],
    "cavalry": ["kỵ", "trùng kỵ", "bạch kỵ", "phiêu kỵ", "hổ báo kỵ"],
    "archer": ["cung", "trường cung", "nỏ", "liên nỏ"],
    "strategist": ["quan văn", "sách sĩ", "mưu sĩ"],
}
# Tên đặc biệt / tướng — không dùng làm đại diện bậc
SKIP_REP = re.compile(
    r"^(Lữ Bố|Áp Dữ|Người Gỗ|BOSS|Hoàng Cân|Thí Luyện|Man Hoang)",
    re.I,
)

by: dict[str, dict[str, list]] = {}
for u in player:
    by.setdefault(u["troop"], {}).setdefault(str(u["tier"]), []).append(u)


def pick_rep(troop: str, tier: str, items: list[dict]) -> dict:
    usable = [x for x in items if not SKIP_REP.match(x["name"])] or items
    prefs = SIMPLE.get(troop, [])
    for p in prefs:
        for it in usable:
            if it["name"].lower() == p or (
                p in it["name"].lower() and len(it["name"]) <= 14
            ):
                return it
    # ưu tiên có mô tả + tên ngắn
    return sorted(
        usable,
        key=lambda x: (
            0 if x.get("desc") else 1,
            len(x["name"]),
            -len(x.get("statTags") or []),
        ),
    )[0]


tier_catalog: dict = {}
for troop, tiers in by.items():
    tier_catalog[troop] = {}
    for t, items in tiers.items():
        pick = pick_rep(troop, t, items)
        tier_catalog[troop][t] = {
            "id": pick["id"],
            "name": pick["name"],
            "wikiCap": pick["wikiCap"],
            "desc": pick["desc"],
            "statTags": pick["statTags"],
            "statBias": pick["statBias"],
            "iconFile": pick["iconFile"],
            "iconUrl": pick["iconUrl"],
            "alts": [
                {"name": x["name"], "desc": x["desc"], "statTags": x["statTags"]}
                for x in items[:8]
                if not SKIP_REP.match(x["name"])
            ],
        }

# Aggregate bias theo loại (trung bình các đơn vị player không thuyền)
type_bias: dict = {}
for troop in ("infantry", "spear", "cavalry", "archer", "strategist"):
    rows = [u for u in player if u["troop"] == troop]
    if not rows:
        type_bias[troop] = {"vuLuc": 1.0, "tongLinh": 1.0, "triLuc": 1.0}
        continue
    n = len(rows)
    type_bias[troop] = {
        "vuLuc": round(sum(u["statBias"]["vuLuc"] for u in rows) / n, 3),
        "tongLinh": round(sum(u["statBias"]["tongLinh"] for u in rows) / n, 3),
        "triLuc": round(sum(u["statBias"]["triLuc"] for u in rows) / n, 3),
    }

npc_catalog: dict = {}
for u in npc:
    npc_catalog.setdefault(u["troop"], []).append(
        {
            "id": u["id"],
            "name": u["name"],
            "tier": u["tier"],
            "wikiCap": u["wikiCap"],
            "loai": u["loai"],
            "desc": u["desc"],
            "statTags": u["statTags"],
            "statBias": u["statBias"],
            "iconFile": u["iconFile"],
            "iconUrl": u["iconUrl"],
        }
    )

# Tên bậc gợi ý cho troops.json (player only)
tier_names: dict = {}
for troop, tiers in tier_catalog.items():
    names = []
    for t in range(1, 7):
        info = tiers.get(str(t))
        names.append(info["name"] if info else f"Bậc {t}")
    tier_names[troop] = names

payload = {
    "schemaVersion": 2,
    "source": "https://ngoalong.vnggames.com/ngoa-long-wiki/binh-chung",
    "note": "playerUnits = binh tướng dùng được; npcUnits = phó bản/NPC — KHÔNG gắn art/chỉ số cho tướng người chơi.",
    "meleeTriangle": ["cavalry", "infantry", "spear"],
    "typeStatBias": type_bias,
    "tierNames": tier_names,
    "playerByTroopTier": tier_catalog,
    "npcByTroop": npc_catalog,
    "npcNames": sorted({u["name"] for u in npc}),
    "allUnits": units,
}

out_path = OUT_DATA / "troops-wiki.json"
out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
(OUT_WIKI / "troops-wiki.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print("wrote", out_path)
for tr, tiers in sorted(tier_catalog.items()):
    print(tr, {k: v["name"] for k, v in sorted(tiers.items(), key=lambda x: int(x[0]))})
print("typeStatBias", type_bias)
print("npc sample", [n["name"] for n in npc[:10]])
