# -*- coding: utf-8 -*-
"""
Đồng bộ TOÀN BỘ tướng đã match wiki → data local:

- chỉ số base (Thống / Võ / Trí + HP) theo wiki leadership/war/intellect
- statsByQuality + growthRates từ wiki growth[]
- quality = viMaxQ (map 7 phẩm)
- awakenByQuality: cost giác ngộ theo từng phẩm (viTiers[].cost)
- materials giác ngộ → items.json (slot material)
- thêm tướng wiki còn thiếu (orphan)

Không gắn 1 tướng mẫu — duyệt hết _dl/wiki-heroes/hero/*.json.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DL_HERO = ROOT / "_dl" / "wiki-heroes" / "hero"
GENS_PATH = ROOT / "data" / "generals.json"
ITEMS_PATH = ROOT / "data" / "items.json"
OUT_MATS = ROOT / "data" / "wiki" / "awaken-materials.json"
OUT_REPORT = ROOT / "data" / "wiki" / "general-core-sync.json"

WIKI_Q_TO_GAME = {
    1: "white",
    2: "green",
    3: "blue",
    5: "purple",
    6: "orange",
    7: "red",
    8: "gold",
}

UNIT_MAP = {
    "枪兵": "spear",
    "骑兵": "cavalry",
    "步兵": "infantry",
    "弓兵": "archer",
    "谋士": "strategist",
    "文官": "strategist",
}

# Phẩm vật liệu giác ngộ (gợi ý rarity theo bậc dùng)
MAT_RARITY = {
    "Bánh Bao": "white",
    "Thịt": "white",
    "Rượu": "white",
    "Trân Châu": "green",
    "Ngọc": "green",
    "Kim Lô": "green",
    "Hổ Phách": "blue",
    "Lam Bảo Thạch": "blue",
    "Lang Nha Ngọc": "blue",
    "Tuyết Liên": "purple",
    "Linh Chi": "purple",
    "Hà Thủ Ô": "purple",
    "Bàn Đào": "orange",
    "Thanh Liên": "orange",
    "Nhân Sâm Quả": "orange",
    "Quỳnh Tương": "red",
    "Chu Quả": "red",
    "Thiên Mai": "red",
}


def norm(s: str) -> str:
    return unicodedata.normalize("NFC", (s or "").strip().lower())


def slugify(name: str) -> str:
    s = norm(name)
    repl = str.maketrans(
        {
            "à": "a", "á": "a", "ạ": "a", "ả": "a", "ã": "a",
            "ă": "a", "ằ": "a", "ắ": "a", "ặ": "a", "ẳ": "a", "ẵ": "a",
            "â": "a", "ầ": "a", "ấ": "a", "ậ": "a", "ẩ": "a", "ẫ": "a",
            "è": "e", "é": "e", "ẹ": "e", "ẻ": "e", "ẽ": "e",
            "ê": "e", "ề": "e", "ế": "e", "ệ": "e", "ể": "e", "ễ": "e",
            "ì": "i", "í": "i", "ị": "i", "ỉ": "i", "ĩ": "i",
            "ò": "o", "ó": "o", "ọ": "o", "ỏ": "o", "õ": "o",
            "ô": "o", "ồ": "o", "ố": "o", "ộ": "o", "ổ": "o", "ỗ": "o",
            "ơ": "o", "ờ": "o", "ớ": "o", "ợ": "o", "ở": "o", "ỡ": "o",
            "ù": "u", "ú": "u", "ụ": "u", "ủ": "u", "ũ": "u",
            "ư": "u", "ừ": "u", "ứ": "u", "ự": "u", "ử": "u", "ữ": "u",
            "ỳ": "y", "ý": "y", "ỵ": "y", "ỷ": "y", "ỹ": "y",
            "đ": "d",
        }
    )
    s = s.translate(repl)
    s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
    return s or "mat"


def mat_id(name: str) -> str:
    return f"mat_{slugify(name)}"


def troop_of(units) -> tuple[str, str | None]:
    mapped = []
    for u in units or []:
        t = UNIT_MAP.get(u)
        if t and t not in mapped:
            mapped.append(t)
    if not mapped:
        return "infantry", None
    if len(mapped) == 1:
        return mapped[0], None
    return mapped[0], mapped[1]


def faction_of(d: dict) -> str:
    f = (d.get("faction") or "").lower()
    if f in ("shu", "wei", "wu"):
        return f
    if f == "qun":
        return "other"
    nat = d.get("nation") or ""
    return {"Thục": "shu", "Ngụy": "wei", "Ngô": "wu", "Quần": "other", "Trung lập": "other"}.get(
        nat, "other"
    )


def hp_of(lead: int, war: int) -> int:
    return 1200 + int(lead) * 18 + int(war) * 2


def growth_maps(d: dict) -> tuple[dict, dict, dict]:
    """statsByQuality, growthRatesByQuality, growthRates (at max)."""
    stats: dict[str, dict] = {}
    rates: dict[str, dict] = {}
    for row in d.get("growth") or []:
        q = int(row.get("q") or 0)
        gq = WIKI_Q_TO_GAME.get(q)
        if not gq:
            continue
        lead = int(row.get("lead") or 0)
        war = int(row.get("war") or 0)
        intel = int(row.get("int") or 0)
        stats[gq] = {
            "tongLinh": lead,
            "vuLuc": war,
            "triLuc": intel,
            "hp": hp_of(lead, war),
        }
        rates[gq] = {
            "tongLinh": float(row.get("gl") or 1),
            "vuLuc": float(row.get("gw") or 1),
            "triLuc": float(row.get("gi") or 1),
        }
    vmax = int(d.get("viMaxQ") or d.get("quality") or 1)
    gq_max = WIKI_Q_TO_GAME.get(vmax) or "white"
    growth_at = rates.get(gq_max) or {"tongLinh": 1.0, "vuLuc": 1.0, "triLuc": 1.0}
    return stats, rates, growth_at


def awaken_map(d: dict) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for t in d.get("viTiers") or []:
        q = int(t.get("q") or 0)
        gq = WIKI_Q_TO_GAME.get(q)
        if not gq:
            continue
        costs = []
        for c in t.get("cost") or []:
            name = (c.get("name") or "").strip()
            if not name:
                continue
            costs.append(
                {
                    "itemId": mat_id(name),
                    "name": name,
                    "qty": int(c.get("qty") or 0),
                    "icon": c.get("icon") or None,
                }
            )
        entry: dict = {}
        if costs:
            entry["cost"] = costs
        access = (t.get("access") or "").strip()
        if access:
            entry["access"] = access
        if entry:
            out[gq] = entry
    return out


def ensure_materials(items_doc: dict, names: set[str]) -> int:
    lst = items_doc.setdefault("list", [])
    by_id = {it["id"]: it for it in lst}
    by_name = {it.get("name"): it for it in lst}
    slots = items_doc.setdefault("slots", [])
    if "material" not in slots:
        slots.append("material")
    slot_names = items_doc.setdefault("slotNames", {})
    slot_names.setdefault("material", "Nguyên liệu")
    added = 0
    for name in sorted(names):
        mid = mat_id(name)
        if mid in by_id or name in by_name:
            continue
        lst.append(
            {
                "id": mid,
                "name": name,
                "slot": "material",
                "rarity": MAT_RARITY.get(name, "white"),
                "bonuses": {},
                "desc": f"Nguyên liệu giác ngộ võ tướng (wiki): {name}.",
                "source": "wiki-awaken",
            }
        )
        added += 1
    return added


def apply_wiki_to_general(g: dict, d: dict) -> dict:
    """Mutate general fields from wiki hero JSON. Returns change flags."""
    flags = {"stats": False, "quality": False, "awaken": False, "growth": False, "portrait": False}
    lead = int(d.get("leadership") or (g.get("base") or {}).get("tongLinh") or 50)
    war = int(d.get("war") or (g.get("base") or {}).get("vuLuc") or 50)
    intel = int(d.get("intellect") or (g.get("base") or {}).get("triLuc") or 50)
    new_base = {
        "tongLinh": lead,
        "vuLuc": war,
        "triLuc": intel,
        "hp": hp_of(lead, war),
    }
    if g.get("base") != new_base:
        flags["stats"] = True
    g["base"] = new_base

    vmax = int(d.get("viMaxQ") or d.get("quality") or 1)
    q_key = WIKI_Q_TO_GAME.get(vmax) or g.get("quality") or "white"
    # Prefer stats at viMaxQ if growth has that row
    stats_q, rates_q, growth_at = growth_maps(d)
    if q_key in stats_q:
        if g.get("base") != stats_q[q_key]:
            flags["stats"] = True
        g["base"] = dict(stats_q[q_key])
    if g.get("quality") != q_key:
        flags["quality"] = True
    g["quality"] = q_key

    g["statsByQuality"] = stats_q
    g["growthRatesByQuality"] = rates_q
    if g.get("growthRates") != growth_at:
        flags["growth"] = True
    g["growthRates"] = growth_at

    awaken = awaken_map(d)
    if awaken:
        g["awakenByQuality"] = awaken
        flags["awaken"] = True
    elif "awakenByQuality" in g:
        del g["awakenByQuality"]

    bio = (d.get("bio") or "").strip()
    if bio:
        g["bio"] = bio[:400]
    if d.get("nameZh"):
        g["nameZh"] = d["nameZh"]
    g["wikiMaxQuality"] = q_key
    g["wikiMaxQ"] = vmax
    if d.get("viMaxQName"):
        g["wikiMaxQName"] = d["viMaxQName"]

    troop, troop2 = troop_of(d.get("units"))
    if troop:
        g["troop"] = troop
    if troop2:
        g["troop2"] = troop2
    elif "troop2" in g and not troop2:
        # keep existing troop2 if wiki only lists one
        pass

    # Portrait wiki CDN icons/{hash}
    img = (d.get("img") or d.get("imgFallback") or "").strip()
    if img:
        g["portrait"] = img
        g["portraitUrl"] = (
            "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/"
            "2026-ngoa-long-wiki-clone/icons/" + img
        )
        flags["portrait"] = True
    units = d.get("units") or []
    if units:
        g["wikiUnits"] = list(units)

    return flags


def stub_general(d: dict) -> dict:
    wid = str(d.get("id"))
    lead = int(d.get("leadership") or 50)
    war = int(d.get("war") or 50)
    intel = int(d.get("intellect") or 50)
    vmax = int(d.get("viMaxQ") or d.get("quality") or 1)
    q_key = WIKI_Q_TO_GAME.get(vmax) or "white"
    troop, troop2 = troop_of(d.get("units"))
    stats_q, rates_q, growth_at = growth_maps(d)
    base = stats_q.get(q_key) or {
        "tongLinh": lead,
        "vuLuc": war,
        "triLuc": intel,
        "hp": hp_of(lead, war),
    }
    entry = {
        "id": f"w{wid}",
        "name": d.get("name") or f"Wiki {wid}",
        "faction": faction_of(d),
        "quality": q_key,
        "troop": troop,
        "base": base,
        "skillId": "basic_strike",
        "skillsByQuality": {},
        "wikiHeroId": wid,
        "tags": ["wiki"],
        "obtain": "wiki",
        "npcOnly": True,
        "statsByQuality": stats_q,
        "growthRatesByQuality": rates_q,
        "growthRates": growth_at,
        "wikiMaxQuality": q_key,
        "wikiMaxQ": vmax,
    }
    if troop2:
        entry["troop2"] = troop2
    awaken = awaken_map(d)
    if awaken:
        entry["awakenByQuality"] = awaken
    bio = (d.get("bio") or "").strip()
    if bio:
        entry["bio"] = bio[:400]
    if d.get("nameZh"):
        entry["nameZh"] = d["nameZh"]
    if d.get("viMaxQName"):
        entry["wikiMaxQName"] = d["viMaxQName"]
    img = (d.get("img") or d.get("imgFallback") or "").strip()
    if img:
        entry["portrait"] = img
        entry["portraitUrl"] = (
            "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/"
            "2026-ngoa-long-wiki-clone/icons/" + img
        )
    if d.get("units"):
        entry["wikiUnits"] = list(d["units"])
    return entry


def main() -> int:
    gens = json.loads(GENS_PATH.read_text(encoding="utf-8"))
    items = json.loads(ITEMS_PATH.read_text(encoding="utf-8"))

    # schema hints
    sch = gens.setdefault("schema", {})
    sch["statsByQuality"] = "optional map quality → base stats (wiki growth)"
    sch["growthRates"] = "optional per-general level growth (wiki gl/gw/gi @ max phẩm)"
    sch["growthRatesByQuality"] = "optional map quality → growthRates"
    sch["awakenByQuality"] = "optional map quality → {cost[{itemId,qty,name}], access}"
    sch["wikiHeroId"] = "id CDN wiki hero/{id}.json"
    sch["skillsByQuality"] = "optional map white|…|gold → skillId (wiki phẩm)"

    by_wiki = {str(g.get("wikiHeroId")): g for g in gens["list"] if g.get("wikiHeroId")}
    existing_ids = {g["id"] for g in gens["list"]}
    existing_names = {norm(g.get("name")) for g in gens["list"]}

    mat_names: set[str] = set()
    updated = 0
    stats_n = quality_n = awaken_n = 0
    added = 0
    heroes_seen = 0

    for path in sorted(DL_HERO.glob("*.json"), key=lambda p: int(p.stem) if p.stem.isdigit() else 0):
        d = json.loads(path.read_text(encoding="utf-8"))
        heroes_seen += 1
        wid = str(d.get("id"))
        for t in d.get("viTiers") or []:
            for c in t.get("cost") or []:
                if c.get("name"):
                    mat_names.add(c["name"])
        for c in (d.get("vi") or {}).get("cost") or []:
            if c.get("name"):
                mat_names.add(c["name"])

        g = by_wiki.get(wid)
        if g is None:
            # orphan wiki hero → add NPC
            if norm(d.get("name")) in existing_names:
                continue
            entry = stub_general(d)
            if entry["id"] in existing_ids:
                entry["id"] = f"wiki_{slugify(entry['name'])}_{wid}"
            gens["list"].append(entry)
            by_wiki[wid] = entry
            existing_ids.add(entry["id"])
            existing_names.add(norm(entry["name"]))
            added += 1
            updated += 1
            continue

        flags = apply_wiki_to_general(g, d)
        if any(flags.values()):
            updated += 1
        if flags["stats"]:
            stats_n += 1
        if flags["quality"]:
            quality_n += 1
        if flags["awaken"]:
            awaken_n += 1

    mats_added = ensure_materials(items, mat_names)

    OUT_MATS.parent.mkdir(parents=True, exist_ok=True)
    OUT_MATS.write_text(
        json.dumps(
            {
                "source": "wiki viTiers[].cost",
                "count": len(mat_names),
                "materials": [
                    {"id": mat_id(n), "name": n, "rarity": MAT_RARITY.get(n, "white")}
                    for n in sorted(mat_names)
                ],
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    report = {
        "wikiHeroes": heroes_seen,
        "generalsTotal": len(gens["list"]),
        "withWikiId": sum(1 for g in gens["list"] if g.get("wikiHeroId")),
        "updated": updated,
        "statsChanged": stats_n,
        "qualityChanged": quality_n,
        "awakenAttached": awaken_n,
        "orphansAdded": added,
        "materialsAdded": mats_added,
        "materialNames": sorted(mat_names),
    }
    OUT_REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    GENS_PATH.write_text(json.dumps(gens, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    ITEMS_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"OK heroes={heroes_seen} gens={len(gens['list'])} updated={updated} "
        f"statsΔ={stats_n} qualityΔ={quality_n} awaken={awaken_n} "
        f"added={added} mats+={mats_added}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
