# -*- coding: utf-8 -*-
"""
Thêm tướng wiki chưa có trong generals.json (playable thiếu / NPC wiki).
Gắn skillsByQuality từ viTiers. Id ổn định: w{wikiId}.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DL_HERO = ROOT / "_dl" / "wiki-heroes" / "hero"
GENS_PATH = ROOT / "data" / "generals.json"
SKILLS_PATH = ROOT / "data" / "skills.json"

# Reuse mapping / helpers from import by duplicating minimal bits
WIKI_Q_TO_GAME = {1: "white", 2: "green", 3: "blue", 5: "purple", 6: "orange", 7: "orange", 8: "red"}

UNIT_MAP = {
    "枪兵": "spear",
    "骑兵": "cavalry",
    "步兵": "infantry",
    "弓兵": "archer",
    "谋士": "strategist",
    "文官": "strategist",
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
    return s or "hero"


def q_name_to_tier(qn: str, q: int) -> str:
    # game quality id
    return {
        1: "white",
        2: "green",
        3: "blue",
        5: "purple",
        6: "orange",
        7: "orange",
        8: "red",
    }.get(q, "white")


def fill_sbq(m: dict[str, str]) -> dict[str, str]:
    order = ["white", "green", "blue", "purple", "orange", "red"]
    out, last = {}, None
    for q in order:
        if q in m:
            last = m[q]
        if last:
            out[q] = last
    return out


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
    if f in ("shu", "wei", "wu", "qun"):
        return f if f != "qun" else "other"
    nat = d.get("nation") or ""
    return {"Thục": "shu", "Ngụy": "wei", "Ngô": "wu", "Quần": "other", "Trung lập": "other"}.get(
        nat, "other"
    )


def main() -> int:
    gens = json.loads(GENS_PATH.read_text(encoding="utf-8"))
    skills_doc = json.loads(SKILLS_PATH.read_text(encoding="utf-8"))
    skills = skills_doc["skills"]
    ladders = skills_doc.setdefault("qualityLadders", {})

    existing_wiki = {str(g.get("wikiHeroId")) for g in gens["list"] if g.get("wikiHeroId")}
    existing_names = {norm(g.get("name")) for g in gens["list"]}
    existing_ids = {g["id"] for g in gens["list"]}

    added = 0
    for path in sorted(DL_HERO.glob("*.json"), key=lambda p: int(p.stem) if p.stem.isdigit() else 0):
        d = json.loads(path.read_text(encoding="utf-8"))
        wid = str(d.get("id"))
        name = d.get("name") or ""
        if wid in existing_wiki or norm(name) in existing_names:
            continue

        tiers = d.get("viTiers") or []
        tier_map: dict[str, str] = {}
        for t in sorted(tiers, key=lambda x: x.get("q") or 0):
            sk = t.get("skill") or {}
            sname = (sk.get("name") or "").strip()
            if not sname:
                continue
            sid = slugify(sname)
            if sid not in skills:
                skills[sid] = {
                    "id": sid,
                    "name": sname,
                    "damageType": "physical",
                    "pattern": "single",
                    "power": 1.4,
                    "moraleCost": 100,
                    "fx": {"flash": "steel", "text": sname.upper()[:16], "motif": "slash"},
                    "desc": (sk.get("desc") or "")[:240],
                    "source": "wiki-hero",
                }
            gq = WIKI_Q_TO_GAME.get(int(t.get("q") or 1))
            if gq:
                tier_map[gq] = sid

        if not tier_map:
            continue

        sbq = fill_sbq(tier_map)
        troop, troop2 = troop_of(d.get("units"))
        lead = int(d.get("leadership") or 50)
        war = int(d.get("war") or 50)
        intel = int(d.get("intellect") or 50)
        gid = f"w{wid}"
        if gid in existing_ids:
            gid = f"wiki_{slugify(name)}_{wid}"

        entry = {
            "id": gid,
            "name": name,
            "faction": faction_of(d),
            "quality": q_name_to_tier(d.get("qualityName") or "", int(d.get("quality") or 1)),
            "troop": troop,
            "base": {
                "tongLinh": lead,
                "vuLuc": war,
                "triLuc": intel,
                "hp": 1200 + lead * 18,
            },
            "skillId": sbq.get("white") or next(iter(sbq.values())),
            "skillsByQuality": sbq,
            "wikiHeroId": wid,
            "tags": ["wiki"],
            "obtain": "wiki",
            "npcOnly": True,
        }
        if troop2:
            entry["troop2"] = troop2
        gens["list"].append(entry)
        ladders[entry["skillId"]] = dict(sbq)
        existing_names.add(norm(name))
        existing_wiki.add(wid)
        existing_ids.add(gid)
        added += 1

    GENS_PATH.write_text(json.dumps(gens, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    SKILLS_PATH.write_text(json.dumps(skills_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK added npc/wiki generals: {added}; total now {len(gens['list'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
