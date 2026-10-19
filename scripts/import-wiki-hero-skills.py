# -*- coding: utf-8 -*-
"""
Import chiêu theo phẩm từ _dl/wiki-heroes → data/skills.json + generals.json.

- Match playable + NPC theo tên (có alias)
- Dedup skill theo tên chiêu wiki
- Đọc desc → pattern / effects / flash(motif)
- skillsByQuality trên tướng; skillId = chiêu bậc thấp nhất
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
OUT_MATCH = ROOT / "data" / "wiki" / "hero-match.json"
OUT_MOTIFS = ROOT / "data" / "wiki" / "skill-motifs.json"
DOCS = ROOT / "docs" / "wiki" / "VO-TUONG-SKILLS.md"

# wiki q → game quality key (7 bậc — Thượng Cổ ≠ Thái Sơ ≠ Thần Hoàng)
WIKI_Q_TO_GAME = {
    1: "white",  # Thường
    2: "green",  # Chiến
    3: "blue",  # Thần
    5: "purple",  # Truyền thuyết
    6: "orange",  # Thượng Cổ
    7: "red",  # Thái Sơ
    8: "gold",  # Thần Hoàng
}

NAME_ALIASES = {
    "Giả Hủ": "Giả Hử",
    "Trương Cáp": "Trương Hợp",
    "Lã Bố": "Lữ Bố",
    "Tuân Úc": "Tuân Vực",
    "Nhạc Tiến": "Lạc Tiến",
    "Công Tôn Toản": "Công Tôn Toán",
    "Thư Thụ": "Tữ Thụ",
    "Văn Xú": "Văn Sửu",
    # generic / giữ unmatched có chủ đích
}


def norm(s: str) -> str:
    return unicodedata.normalize("NFC", (s or "").strip().lower())


def slugify(name: str) -> str:
    s = norm(name)
    repl = {
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
        "·": "_", "•": "_",
    }
    out = []
    for ch in s:
        out.append(repl.get(ch, ch))
    s = "".join(out)
    s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
    return s or "skill"


def banner(name: str) -> str:
    s = unicodedata.normalize("NFC", name).upper()
    s = re.sub(r"\s+", " ", s).strip()
    return s[:18]


def parse_power(desc: str, q: int) -> float:
    """Lấy % Pháp/Vật công đầu tiên; scale về power ~1.0–2.2."""
    if not desc:
        return {1: 1.35, 2: 1.45, 3: 1.55, 5: 1.65, 6: 1.75, 7: 1.85, 8: 1.95}.get(q, 1.4)
    # bỏ qua % quá lớn kiểu 12800% wiki endgame — clamp
    nums = [int(x) for x in re.findall(r"(\d+)\s*%", desc)]
    if not nums:
        return {1: 1.35, 2: 1.45, 3: 1.55, 5: 1.65, 6: 1.75, 7: 1.85, 8: 1.95}.get(q, 1.4)
    pct = nums[0]
    if pct >= 500:
        # endgame wiki % → map theo bậc
        return min(2.2, 1.35 + (q if q < 5 else q - 1) * 0.08)
    return round(min(2.2, max(1.05, pct / 100.0)), 2)


def parse_hits(desc: str) -> int:
    m = re.search(r"(\d+)\s*lần", desc or "", re.I)
    if m:
        return max(1, min(5, int(m.group(1))))
    if re.search(r"2\s*nhịp|hai\s*lần|×\s*2|x2", desc or "", re.I):
        return 2
    return 1


def infer_pattern(desc: str) -> str:
    d = (desc or "").lower()
    if re.search(r"toàn\s*(phe\s*)?(địch|quân địch)|tất cả.*(địch|quân)", d):
        return "all"
    if re.search(r"hàng\s*ngang|ngang", d):
        return "row"
    if re.search(r"hàng\s*dọc|đường\s*thẳng|dọc", d):
        return "column"
    if re.search(r"hàng\s*trước", d):
        return "front_row"
    if re.search(r"đồng\s*đội|phe\s*ta|toàn\s*quân\s*ta", d) and not re.search(
        r"địch|kẻ địch", d
    ):
        return "ally_all"
    if re.search(r"bản\s*thân", d) and not re.search(r"kẻ địch|địch", d):
        return "self"
    return "single"


def infer_damage_type(desc: str) -> str:
    d = (desc or "").lower()
    if "[c.pháp]" in d or "pháp công" in d or "chiến pháp" in d:
        return "physical"  # C.Pháp trong NL = chiến pháp (physical-ish in our engine)
    if "[kế sách]" in d or "mưu công" in d or "kế sách" in d:
        return "strategy"
    if "mưu" in d:
        return "strategy"
    return "physical"


def infer_effects(desc: str) -> list[dict]:
    d = (desc or "").lower()
    effects: list[dict] = []
    if "hỗn loạn" in d or "choáng" in d or "hôn mê" in d:
        effects.append({"type": "stun", "chance": 0.55, "duration": 1})
    if "ám tế" in d or "không thể hồi phục sĩ khí" in d or "không thể tăng sĩ khí" in d:
        effects.append({"type": "silence", "chance": 0.7, "duration": 2})
    if "trúng độc" in d or "kịch độc" in d or "thi độc" in d or re.search(r"(^|[^\w])độc([^\w]|$)", d):
        effects.append({"type": "poison", "duration": 2})
    if "thiêu đốt" in d or "thiên hỏa" in d:
        effects.append({"type": "burn", "duration": 2})
    if "thiết bích" in d:
        effects.append({"type": "def_up", "value": 0.35, "duration": 1, "target": "self"})
    if "khóa vây" in d:
        effects.append({"type": "stun", "chance": 1.0, "duration": 1})
    if "trị liệu" in d or ("hồi phục" in d and "binh" in d) or ("hồi" in d and "lính" in d):
        effects.append({"type": "heal_pct", "value": 0.12, "target": "ally"})
    if "bản thân hồi" in d and "sĩ khí" in d:
        effects.append({"type": "morale_boost", "value": 40, "target": "self"})
    if "giảm" in d and "phòng" in d:
        effects.append({"type": "def_down", "value": 0.12, "duration": 2})
    if "anh dũng" in d or ("tăng" in d and "tấn công" in d and "phe ta" in d):
        effects.append({"type": "atk_up", "value": 0.12, "duration": 2, "target": "ally"})
    # dedupe by type
    seen = set()
    out = []
    for e in effects:
        if e["type"] in seen:
            continue
        seen.add(e["type"])
        out.append(e)
    return out


def infer_motif_flash(name: str, desc: str) -> tuple[str, str]:
    """Return (motif, flash). Motif for docs; flash for runtime."""
    n = (name or "").lower()
    d = (desc or "").lower()
    blob = n + " " + d

    if any(k in blob for k in ("xoáy", "lốc", "dòng xoáy", "cuồng phong", "phong")):
        return "whirlwind", "whirlwind"
    if any(k in blob for k in ("lang ", "lang tuyền", "sói", "lang tuyen")):
        return "wolf", "wolf"
    if any(k in n for k in ("hổ", "ho khi", "hổ khí", "hổ sát", "hổ xung")) or "hổ" in n:
        return "tiger", "tiger"
    if any(k in blob for k in ("rồng", "long ", "thương long", "hỏa long", "long nỗ")):
        return "dragon", "dragon"
    if "xà" in n or "rắn" in blob or "độc xà" in blob:
        return "snake", "snake"
    if "thiết bích" in n:
        return "shield", "gold_soft"
    if "thiết bích" in d and infer_pattern(desc) in ("self", "ally_all"):
        return "shield", "gold_soft"
    if any(k in blob for k in ("hỏa", "thiên hỏa", "viêm", "hồng")):
        return "fire", "fire_rain"
    if any(k in blob for k in ("lôi", "sét", "điện", "sấm")):
        return "thunder", "thunder"
    if any(k in blob for k in ("thủy", "hải", "vũ", "mưa")) and "pháp" in d:
        return "water", "blue_water"
    if any(k in blob for k in ("độc", "trúng độc", "kịch độc")):
        return "poison", "green_poison"
    if any(k in blob for k in ("bát quái", "không thành", "huyễn")):
        return "bagua", "bagua"
    if any(k in blob for k in ("trị liệu", "cam vũ", "hồi phục", "nhân đức")):
        return "heal", "gold_soft"
    if "ám tế" in blob or "ám sát" in blob:
        return "shadow", "purple"
    if infer_pattern(desc) in ("self", "ally_all") and "thiết bích" in d:
        return "shield", "pure" if False else "gold_soft"

    # role defaults
    pat = infer_pattern(desc)
    if pat in ("self", "ally_all"):
        return "buff", "gold_soft"
    if infer_damage_type(desc) == "strategy":
        return "arcane", "blue"
    return "slash", "steel"


def load_wiki_hero(hid: str) -> dict | None:
    p = DL_HERO / f"{hid}.json"
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding="utf-8"))


def build_wiki_name_index() -> dict[str, str]:
    """norm name → wiki id (id lớn hơn thắng nếu trùng tên — thường bản VNG mới hơn)."""
    idx: dict[str, str] = {}
    for p in sorted(DL_HERO.glob("*.json"), key=lambda x: int(x.stem) if x.stem.isdigit() else 0):
        d = json.loads(p.read_text(encoding="utf-8"))
        name = d.get("name") or ""
        idx[norm(name)] = str(d.get("id"))
        vi = (d.get("vi") or {}).get("name")
        if vi:
            idx[norm(vi)] = str(d.get("id"))
    return idx


def match_general(g: dict, wiki_by_name: dict[str, str]) -> str | None:
    # Ưu tiên wikiHeroId đã gắn (tránh trùng tên đè id khác)
    existing = g.get("wikiHeroId")
    if existing is not None and str(existing).strip() != "":
        return str(existing)
    name = g.get("name") or ""
    alias = NAME_ALIASES.get(name, name)
    return wiki_by_name.get(norm(alias)) or wiki_by_name.get(norm(name))


def skill_from_tier(name: str, desc: str, q: int, q_name: str) -> dict:
    sid = slugify(name)
    motif, flash = infer_motif_flash(name, desc)
    hits = parse_hits(desc)
    sk = {
        "id": sid,
        "name": name,
        "damageType": infer_damage_type(desc),
        "pattern": infer_pattern(desc),
        "power": parse_power(desc, q),
        "moraleCost": 100,
        "fx": {
            "flash": flash,
            "text": banner(name),
            "motif": motif,
        },
        "desc": (desc or "")[:280],
        "wikiQuality": q_name,
        "source": "wiki-hero",
    }
    if hits > 1:
        sk["hits"] = hits
    effects = infer_effects(desc)
    if effects:
        sk["effects"] = effects
    return sk


def fill_skills_by_quality(tier_map: dict[str, str]) -> dict[str, str]:
    """Ensure white→gold cascade filled."""
    order = ["white", "green", "blue", "purple", "orange", "red", "gold"]
    out = {}
    last = None
    for q in order:
        if q in tier_map:
            last = tier_map[q]
        if last:
            out[q] = last
    return out


def main() -> int:
    gens = json.loads(GENS_PATH.read_text(encoding="utf-8"))
    skills_doc = json.loads(SKILLS_PATH.read_text(encoding="utf-8"))
    skills: dict = skills_doc.setdefault("skills", {})
    ladders: dict = skills_doc.setdefault("qualityLadders", {})

    wiki_by_name = build_wiki_name_index()
    matches = []
    unmatched = []

    # Pass 0: tạo/cập nhật skill catalog từ TOÀN BỘ wiki heroes (kể cả chưa có trong game)
    new_skills = 0
    for path in DL_HERO.glob("*.json"):
        wh = json.loads(path.read_text(encoding="utf-8"))
        for t in wh.get("viTiers") or []:
            sk = t.get("skill") or {}
            sname = (sk.get("name") or "").strip()
            if not sname:
                continue
            desc = sk.get("desc") or ""
            q = int(t.get("q") or 1)
            qn = t.get("qName") or ""
            entry = skill_from_tier(sname, desc, q, qn)
            sid = entry["id"]
            if sid not in skills:
                skills[sid] = entry
                new_skills += 1
            elif skills[sid].get("source") == "wiki-hero":
                # giữ bản desc dài hơn / power theo bậc cao hơn nếu cùng tên
                old = skills[sid]
                if len(entry.get("desc") or "") > len(old.get("desc") or ""):
                    skills[sid] = entry
            else:
                fx = skills[sid].setdefault("fx", {})
                if not fx.get("motif"):
                    fx["motif"] = entry["fx"]["motif"]

    updated_gens = 0

    for g in gens["list"]:
        wid = match_general(g, wiki_by_name)
        if not wid:
            unmatched.append(
                {
                    "id": g["id"],
                    "name": g.get("name"),
                    "npcOnly": bool(g.get("npcOnly")),
                    "reason": "no_wiki_name_match",
                }
            )
            continue

        wh = load_wiki_hero(wid)
        if not wh:
            unmatched.append(
                {
                    "id": g["id"],
                    "name": g.get("name"),
                    "npcOnly": bool(g.get("npcOnly")),
                    "reason": f"missing_file_{wid}",
                }
            )
            continue

        tiers = wh.get("viTiers") or []
        # sort by q ascending; for orange, higher q overwrites
        tier_skill_ids: dict[str, str] = {}
        tier_meta = []
        for t in sorted(tiers, key=lambda x: x.get("q") or 0):
            sk = t.get("skill") or {}
            sname = (sk.get("name") or "").strip()
            if not sname:
                continue
            desc = sk.get("desc") or ""
            q = int(t.get("q") or 1)
            qn = t.get("qName") or ""
            entry = skill_from_tier(sname, desc, q, qn)
            sid = entry["id"]
            if sid not in skills:
                skills[sid] = entry
                new_skills += 1
            else:
                # merge motif if missing on hand-authored
                old = skills[sid]
                if old.get("source") != "wiki-hero":
                    # keep hand-tuned combat numbers; still attach motif if absent
                    fx = old.setdefault("fx", {})
                    if not fx.get("motif"):
                        fx["motif"] = entry["fx"]["motif"]
                    if not fx.get("flash"):
                        fx["flash"] = entry["fx"]["flash"]
                else:
                    # refresh wiki-sourced
                    skills[sid] = entry
            gq = WIKI_Q_TO_GAME.get(q)
            if gq:
                tier_skill_ids[gq] = sid
            tier_meta.append(
                {
                    "q": q,
                    "qName": qn,
                    "skillId": sid,
                    "skillName": sname,
                    "motif": entry["fx"]["motif"],
                    "flash": entry["fx"]["flash"],
                }
            )

        if not tier_skill_ids:
            unmatched.append(
                {
                    "id": g["id"],
                    "name": g.get("name"),
                    "wikiId": wid,
                    "npcOnly": bool(g.get("npcOnly")),
                    "reason": "no_tiers",
                }
            )
            continue

        sbq = fill_skills_by_quality(tier_skill_ids)
        g["wikiHeroId"] = wid
        g["skillsByQuality"] = sbq
        # base skillId = lowest tier
        g["skillId"] = sbq.get("white") or next(iter(sbq.values()))
        # quality ladder keyed by base skill for resolveSkillId fallback
        base = g["skillId"]
        ladders[base] = dict(sbq)
        updated_gens += 1
        matches.append(
            {
                "generalId": g["id"],
                "name": g.get("name"),
                "npcOnly": bool(g.get("npcOnly")),
                "wikiId": wid,
                "skillsByQuality": sbq,
                "tiers": tier_meta,
            }
        )

    # motif catalog
    motifs = {}
    for sid, sk in skills.items():
        fx = sk.get("fx") or {}
        motifs[sid] = {
            "name": sk.get("name"),
            "motif": fx.get("motif"),
            "flash": fx.get("flash"),
            "pattern": sk.get("pattern"),
            "source": sk.get("source"),
        }

    GENS_PATH.write_text(json.dumps(gens, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    SKILLS_PATH.write_text(json.dumps(skills_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    OUT_MATCH.parent.mkdir(parents=True, exist_ok=True)
    report = {
        "matched": len(matches),
        "unmatched": len(unmatched),
        "newSkills": new_skills,
        "updatedGenerals": updated_gens,
        "playableMatched": sum(1 for m in matches if not m["npcOnly"]),
        "npcMatched": sum(1 for m in matches if m["npcOnly"]),
        "matches": matches,
        "unmatchedList": unmatched,
    }
    OUT_MATCH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MOTIFS.write_text(json.dumps(motifs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # docs
    lines = [
        "# Import chiêu võ tướng (wiki → game)",
        "",
        f"- Matched: **{len(matches)}** (playable {report['playableMatched']} · NPC {report['npcMatched']})",
        f"- Unmatched: **{len(unmatched)}** (recruit generic / thiếu wiki)",
        f"- New skills added: **{new_skills}**",
        "",
        "## Ví dụ Bàng Đức",
        "",
    ]
    bang = next((m for m in matches if m["name"] == "Bàng Đức"), None)
    if bang:
        for t in bang["tiers"]:
            lines.append(
                f"- **{t['qName']}**: `{t['skillId']}` — {t['skillName']} "
                f"(motif `{t['motif']}`, flash `{t['flash']}`)"
            )
    lines += ["", "## Unmatched", ""]
    for u in unmatched:
        lines.append(f"- {u['name']} (`{u['id']}`){' · NPC' if u.get('npcOnly') else ''} — {u.get('reason')}")
    lines.append("")
    DOCS.write_text("\n".join(lines), encoding="utf-8")

    print(
        f"OK matched={len(matches)} (P{report['playableMatched']}/N{report['npcMatched']}) "
        f"unmatched={len(unmatched)} newSkills={new_skills}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
