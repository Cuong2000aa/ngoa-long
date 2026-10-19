# -*- coding: utf-8 -*-
"""
Import trang bị wiki → data/items.json + data/wiki/equip-index.json

Map chỉ số wiki → remake:
  Vật Công / Pháp Công → vuLuc
  Mưu Công → triLuc
  Vật/Pháp/Mưu Phòng → tongLinh
  Lính → hp (×25)
  Bạo Kích / Phản Kích / Né → speed (nhẹ)

Scale base wiki xuống cho cân bằng (base/18, tối thiểu 1).
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DL = ROOT / "_dl" / "wiki-equip"
OUT_ITEMS = ROOT / "data" / "items.json"
OUT_INDEX = ROOT / "data" / "wiki" / "equip-index.json"
DOCS = ROOT / "docs" / "wiki" / "TRANG-BI.md"

SLOT_BY_TYPE = {
    1: "weapon",
    2: "armor",
    3: "horse",
    4: "book",
    5: "cloak",
    6: "shield",
    7: "troop",
}
SLOT_NAMES = {
    "weapon": "Vũ khí",
    "armor": "Giáp",
    "horse": "Ngựa",
    "book": "Sách / Binh thư",
    "cloak": "Áo choàng",
    "shield": "Thuẫn",
    "troop": "Dẫn binh",
    "accessory": "Đồ phổ",
    "material": "Nguyên liệu",
}
# wiki quality 1..6 → remake rarities; cao hơn → red
RARITY_BY_Q = {
    1: "white",
    2: "green",
    3: "blue",
    4: "purple",
    5: "orange",
    6: "red",
}
STAT_MAP = {
    "Vật Công": "vuLuc",
    "Pháp Công": "vuLuc",
    "Mưu Công": "triLuc",
    "Vật Phòng": "tongLinh",
    "Pháp Phòng": "tongLinh",
    "Mưu Phòng": "tongLinh",
    "Lính": "hp",
    "Bạo Kích": "speed",
    "Phản Kích": "speed",
    "Né Tránh": "speed",
}


def scale_stat(label: str, base: float) -> int:
    if base is None:
        return 0
    b = float(base)
    if label == "Lính":
        return max(1, int(round(b * 25)))
    if label in ("Bạo Kích", "Phản Kích", "Né Tránh"):
        return max(1, int(round(b / 8)))
    return max(1, int(round(b / 18)))


def rarity_of(q: int | None) -> str:
    if not q:
        return "white"
    if q >= 7:
        return "red"
    return RARITY_BY_Q.get(int(q), "white")


def bonuses_from_stats(stats: list) -> dict:
    out: dict[str, int] = {}
    for s in stats or []:
        label = s.get("label") or ""
        key = STAT_MAP.get(label)
        if not key:
            continue
        val = scale_stat(label, s.get("base") or 0)
        out[key] = out.get(key, 0) + val
    return out


def keep_materials(old: dict) -> list:
    kept = []
    for it in old.get("list") or []:
        if it.get("slot") == "material" or it.get("keep"):
            kept.append(it)
    return kept


def convert_equip_items(eq: dict) -> list:
    items = []
    for raw in eq.get("items") or []:
        slot = SLOT_BY_TYPE.get(raw.get("type"), "accessory")
        icon = raw.get("icon") or ""
        item = {
            "id": f"wiki_eq_{raw['id']}",
            "wikiId": str(raw["id"]),
            "name": raw.get("name") or f"TB#{raw['id']}",
            "slot": slot,
            "rarity": rarity_of(raw.get("quality")),
            "qualityWiki": raw.get("qualityName"),
            "levelReq": raw.get("level") or 1,
            "bonuses": bonuses_from_stats(raw.get("stats") or []),
            "statsWiki": raw.get("stats") or [],
            "icon": f"assets/items/wiki/{icon}" if icon else None,
            "desc": (raw.get("desc") or "").strip()
            or f"{raw.get('typeName') or slot} · {raw.get('qualityName') or ''} Lv.{raw.get('level') or '?'}".strip(),
            "source": "wiki-equip",
            "cuongHoa": raw.get("cuongHoa"),
            "upgradeFrom": raw.get("upgradeFrom"),
            "upgradeTo": raw.get("upgradeTo"),
            "sell": raw.get("sell"),
        }
        items.append(item)
    return items


def main() -> None:
    eq = json.loads((DL / "equip-detail.json").read_text(encoding="utf-8"))
    old = {}
    if OUT_ITEMS.exists():
        old = json.loads(OUT_ITEMS.read_text(encoding="utf-8"))
    wiki_items = convert_equip_items(eq)
    materials = keep_materials(old)
    # Prefer wiki; drop old non-material duplicates by name optional — full replace gear
    out = {
        "schemaVersion": 3,
        "slots": ["weapon", "armor", "horse", "book", "cloak", "shield", "troop", "accessory", "material"],
        "slotNames": SLOT_NAMES,
        "rarities": ["white", "green", "blue", "purple", "orange", "red"],
        "wiki": {
            "categories": eq.get("equipCategories"),
            "tiers": eq.get("equipTiers"),
            "source": "wiki equip-detail.json",
            "count": len(wiki_items),
        },
        "list": wiki_items + materials,
    }
    OUT_ITEMS.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Index nhẹ
    OUT_INDEX.parent.mkdir(parents=True, exist_ok=True)
    index = {
        "count": len(wiki_items),
        "bySlot": {},
        "items": [
            {
                "id": it["id"],
                "wikiId": it["wikiId"],
                "name": it["name"],
                "slot": it["slot"],
                "rarity": it["rarity"],
                "levelReq": it["levelReq"],
                "icon": it.get("icon"),
                "bonuses": it["bonuses"],
            }
            for it in wiki_items
        ],
    }
    for it in wiki_items:
        index["bySlot"].setdefault(it["slot"], 0)
        index["bySlot"][it["slot"]] += 1
    OUT_INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    DOCS.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Trang bị wiki",
        "",
        f"- Nguồn: `equip-detail.json` ({len(wiki_items)} món)",
        f"- Icon: `assets/items/wiki/`",
        f"- Import: `data/items.json` schema v3",
        "",
        "## Slot",
        "",
    ]
    for k, n in sorted(index["bySlot"].items()):
        lines.append(f"- **{SLOT_NAMES.get(k, k)}** (`{k}`): {n}")
    lines += [
        "",
        "## Map chỉ số",
        "",
        "| Wiki | Remake | Scale |",
        "|------|--------|-------|",
        "| Vật/Pháp Công | vuLuc | /18 |",
        "| Mưu Công | triLuc | /18 |",
        "| Phòng (vật/pháp/mưu) | tongLinh | /18 |",
        "| Lính | hp | ×25 |",
        "",
        "```bash",
        "python3 scripts/fetch-wiki-equip.py",
        "python3 scripts/import-wiki-equip.py",
        "python3 scripts/rebuild-bundle-utf8.py",
        "```",
        "",
    ]
    DOCS.write_text("\n".join(lines), encoding="utf-8")
    print(f"OK items={len(out['list'])} wiki={len(wiki_items)} materials={len(materials)}")
    print(" →", OUT_ITEMS)
    print(" →", OUT_INDEX)


if __name__ == "__main__":
    main()
