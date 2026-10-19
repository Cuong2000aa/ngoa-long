# -*- coding: utf-8 -*-
"""
Map art wiki theo CẤP (bậc) — chỉ binh tướng người chơi (loại NPC phó bản).
Ưu tiên data/troops-wiki.json nếu đã parse; fallback parse HTML.
"""
from __future__ import annotations

import json
import re
import shutil
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DL = ROOT / "_dl" / "wiki-binh"
OUT = ROOT / "assets" / "units" / "wiki"
BATTLE = ROOT / "assets" / "units" / "battle"
SHEETS = ROOT / "assets" / "units" / "sheets"
DATA = ROOT / "data"
OUT.mkdir(parents=True, exist_ok=True)
BATTLE.mkdir(parents=True, exist_ok=True)
SHEETS.mkdir(parents=True, exist_ok=True)

html = (DL / "page.html").read_text(encoding="utf-8", errors="ignore")
manifest = {m["url"]: m["file"] for m in json.loads((OUT / "manifest.json").read_text(encoding="utf-8"))}

UA = "Mozilla/5.0"
TYPE_KEYS = {
    "infantry": ["bộ", "thuẫn", "đao", "kiếm vệ", "giáp bộ", "lang", "cấm vệ"],
    "spear": ["thương", "kích", "mâu", "giao sách", "chùy", "võ sư"],
    "cavalry": ["kỵ", "bạch mã", "hổ báo", "phiêu", "long kỵ", "đao xa", "tượng", "mộc ngưu"],
    "archer": ["cung", "nỏ", "tiễn"],
    "strategist": ["quan văn", "mưu", "sách sĩ", "tu sĩ", "đạo thuật", "huyền"],
}
LOAI_MAP = {
    "bo-binh": "infantry",
    "thuong-binh": "spear",
    "ky-binh": "cavalry",
    "cung-binh": "archer",
    "quan-van": "strategist",
}


def classify(name: str) -> str | None:
    n = name.lower()
    scores = {k: 0 for k in TYPE_KEYS}
    for k, words in TYPE_KEYS.items():
        for w in words:
            if w in n:
                scores[k] += len(w)
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else None


def wiki_cap_to_tier(cap: int) -> int:
    if cap <= 1:
        return 1
    if cap >= 6:
        return 6
    return cap


entries = []
wiki_json = DATA / "troops-wiki.json"
if wiki_json.exists():
    payload = json.loads(wiki_json.read_text(encoding="utf-8"))
    for u in payload.get("allUnits") or []:
        if u.get("npc") or u.get("boat"):
            continue
        troop = u.get("troop")
        if troop not in TYPE_KEYS:
            continue
        f = u.get("iconFile") or manifest.get(u.get("iconUrl") or "")
        entries.append(
            {
                "name": u["name"],
                "url": u.get("iconUrl"),
                "file": f,
                "wikiCap": u.get("wikiCap", 0),
                "tier": u.get("tier") or wiki_cap_to_tier(u.get("wikiCap", 0)),
                "type": troop,
                "npc": False,
            }
        )
    print("from troops-wiki.json player entries", len(entries))
else:
    # Fallback HTML: button cards + data-nlw-npc-nhan
    cap_marks = [(m.start(), int(m.group(1))) for m in re.finditer(r'data-nlw-cap="(\d+)"', html)]

    def cap_at(pos: int) -> int:
        cur = 0
        for p, c in cap_marks:
            if p > pos:
                break
            cur = c
        return cur

    opens = list(re.finditer(r'<button([^>]*data-nlw-unit="(\d+)"[^>]*)>', html, re.I))
    for i, o in enumerate(opens):
        start = o.start()
        end = opens[i + 1].start() if i + 1 < len(opens) else min(start + 2200, len(html))
        block = html[start:end]
        if "data-nlw-npc-nhan" in block:
            continue
        attrs = o.group(1)
        loai_m = re.search(r'data-nlw-loai="([^"]+)"', attrs)
        loai = loai_m.group(1) if loai_m else ""
        if loai.startswith("thuyen") or loai not in LOAI_MAP:
            continue
        alt = re.search(r'alt="([^"]+)"', block)
        if not alt:
            continue
        name = alt.group(1)
        url_m = re.search(
            r'src="(https://cdn-mainsite-aka\.vnggames\.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/[^"]+)"',
            block,
        )
        url = url_m.group(1) if url_m else None
        cap = cap_at(start)
        entries.append(
            {
                "name": name,
                "url": url,
                "file": manifest.get(url) if url else None,
                "wikiCap": cap,
                "tier": wiki_cap_to_tier(cap),
                "type": LOAI_MAP[loai],
                "npc": False,
            }
        )
    print("from HTML player entries", len(entries))

# Special: Hổ Báo Kỵ → cavalry tier 5
for e in entries:
    if "hổ báo kỵ" in e["name"].lower():
        e["type"] = "cavalry"
        e["tier"] = 5
        print("Hổ Báo Kỵ → cavalry tier5", e["file"], (e.get("url") or "")[-40:])

by = {k: {i: [] for i in range(1, 7)} for k in TYPE_KEYS}
for e in entries:
    if e["type"] and e["file"]:
        path = OUT / e["file"]
        if path.exists() and path.stat().st_size >= 3500:
            by[e["type"]][e["tier"]].append(e)

# Prefer simplest names for tier 1
SIMPLE = {
    "infantry": ["bộ", "thuẫn binh", "giáp bộ"],
    "spear": ["thương", "kích"],
    "cavalry": ["kỵ", "bạch kỵ"],
    "archer": ["cung", "nỏ binh"],
    "strategist": ["sách sĩ", "quan văn"],
}


SKIP_REP = re.compile(
    r"^(Lữ Bố|Áp Dữ|Người Gỗ|BOSS|Hoàng Cân|Thí Luyện|Man Hoang)",
    re.I,
)


def pick(type_id: str, tier: int):
    # cascade down if missing
    for t in range(tier, 0, -1):
        items = [e for e in (by[type_id].get(t) or []) if not SKIP_REP.match(e["name"])]
        if not items:
            items = by[type_id].get(t) or []
        if not items:
            continue
        prefs = SIMPLE.get(type_id, [])
        for p in prefs:
            for it in items:
                if it["name"].lower() == p or (p in it["name"].lower() and len(it["name"]) <= 14):
                    return it
        if t <= 2:
            items = sorted(items, key=lambda x: (len(x["name"]), -Path(OUT / x["file"]).stat().st_size))
        else:
            items = sorted(items, key=lambda x: -Path(OUT / x["file"]).stat().st_size)
        return items[0]
    # any of type
    all_t = [e for e in entries if e["type"] == type_id and e["file"] and (OUT / e["file"]).exists()]
    all_t = [e for e in all_t if (OUT / e["file"]).stat().st_size >= 3500 and not SKIP_REP.match(e["name"])]
    return sorted(all_t, key=lambda x: len(x["name"]))[0] if all_t else None


tier_map = {}
for type_id in TYPE_KEYS:
    tier_map[type_id] = {}
    for tier in range(1, 7):
        e = pick(type_id, tier)
        if not e:
            continue
        dest = f"wiki-{type_id}-t{tier}.png"
        shutil.copy2(OUT / e["file"], BATTLE / dest)
        tier_map[type_id][str(tier)] = {
            "file": f"assets/units/battle/{dest}",
            "wikiName": e["name"],
            "wikiCap": e["wikiCap"],
            "source": e["url"],
        }
        print(f"{type_id} t{tier}: {e['name']} (wiki Cấp {e['wikiCap']})")

# Also keep default aliases wiki-{type}.png = tier 1
for type_id, tiers in tier_map.items():
    if "1" in tiers:
        src = ROOT / tiers["1"]["file"]
        shutil.copy2(src, BATTLE / f"wiki-{type_id}.png")

(OUT / "tier-map.json").write_text(json.dumps(tier_map, ensure_ascii=False, indent=2), encoding="utf-8")
(BATTLE / "tier-map.json").write_text(json.dumps(tier_map, ensure_ascii=False, indent=2), encoding="utf-8")

# Download Hổ Báo Kỵ icon explicitly
hobao = next((e for e in entries if "hổ báo kỵ" in e["name"].lower()), None)
if hobao:
    dest = BATTLE / "wiki-cavalry-t5.png"
    # ensure file
    local = OUT / hobao["file"] if hobao["file"] else None
    if local and local.exists():
        shutil.copy2(local, dest)
        print("Hổ Báo Kỵ icon →", dest)
    else:
        req = urllib.request.Request(hobao["url"], headers={"User-Agent": UA, "Referer": "https://ngoalong.vnggames.com/"})
        with urllib.request.urlopen(req, timeout=40) as r:
            dest.write_bytes(r.read())
        print("downloaded Hổ Báo Kỵ", dest.stat().st_size)
    tier_map.setdefault("cavalry", {})["5"] = {
        "file": "assets/units/battle/wiki-cavalry-t5.png",
        "wikiName": "Hổ Báo Kỵ",
        "wikiCap": hobao["wikiCap"],
        "source": hobao["url"],
    }
    (BATTLE / "tier-map.json").write_text(json.dumps(tier_map, ensure_ascii=False, indent=2), encoding="utf-8")

print("done tiers", {k: list(v.keys()) for k, v in tier_map.items()})
