# -*- coding: utf-8 -*-
"""Gắn alt text → icon, phân loại 5 hệ, copy file đại diện vào battle/."""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DL = ROOT / "_dl" / "wiki-binh"
OUT = ROOT / "assets" / "units" / "wiki"
BATTLE = ROOT / "assets" / "units" / "battle"
BATTLE.mkdir(parents=True, exist_ok=True)

html = (DL / "page.html").read_text(encoding="utf-8", errors="ignore")

# img alt + src
pairs = re.findall(
    r'<img[^>]*alt="([^"]+)"[^>]*src="(https://cdn-mainsite-aka\.vnggames\.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/[^"]+)"',
    html,
    re.I,
)
# also src before alt
pairs += re.findall(
    r'<img[^>]*src="(https://cdn-mainsite-aka\.vnggames\.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/[^"]+)"[^>]*alt="([^"]+)"',
    html,
    re.I,
)

norm = []
for a, b in pairs:
    if a.startswith("http"):
        norm.append({"name": b, "url": a})
    else:
        norm.append({"name": a, "url": b})

# dedupe by url
seen = {}
for p in norm:
    seen[p["url"]] = p["name"]
print("named icons", len(seen))

# Map url → local file via manifest
manifest = json.loads((OUT / "manifest.json").read_text(encoding="utf-8"))
url_to_file = {m["url"]: m["file"] for m in manifest}

# Classify by keywords in name / nearby section headers is hard; use name heuristics + section order
# From wiki sections: Bộ, Thương, Kỵ, Cung, Quan Văn
# We'll also parse section headers in HTML
sections = list(re.finditer(r"(Bộ\s*Binh|Thương\s*Binh|Kỵ\s*Binh|Cung\s*Binh|Nỏ\s*Binh|Quan\s*Văn|Mưu\s*Sĩ)", html, re.I))
print("section hits", [s.group(0) for s in sections[:20]])

TYPE_KEYS = {
    "infantry": ["bộ", "thuẫn", "đao binh", "kiếm", "trọng bộ", "cấm vệ", "lang trảo", "thiết giáp"],
    "spear": ["thương", "kích", "mâu", "giao sách", "cự chùy", "võ sư"],
    "cavalry": ["kỵ", "bạch mã", "hổ báo", "phiêu kỵ", "long kỵ", "đao xa", "chiến tượng", "mộc ngưu"],
    "archer": ["cung", "nỏ", "tiễn", "thần tiễn", "liên nỏ"],
    "strategist": ["quan văn", "mưu", "đạo thuật", "tu sĩ", "quân sư", "sách sĩ", "huyền binh"],
}


def classify(name: str) -> str | None:
    n = name.lower()
    scores = {k: 0 for k in TYPE_KEYS}
    for k, words in TYPE_KEYS.items():
        for w in words:
            if w in n:
                scores[k] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else None


# Loại icon NPC (phó bản) — không gắn cho tướng
npc_names: set[str] = set()
wiki_json = ROOT / "data" / "troops-wiki.json"
if wiki_json.exists():
    payload = json.loads(wiki_json.read_text(encoding="utf-8"))
    npc_names = set(payload.get("npcNames") or [])
    for u in payload.get("allUnits") or []:
        if u.get("npc"):
            npc_names.add(u["name"])
else:
    for m in re.finditer(r'data-nlw-npc-nhan[\s\S]{0,400}?alt="([^"]+)"', html, re.I):
        npc_names.add(m.group(1))
    for m in re.finditer(r'alt="([^"]+)"[\s\S]{0,200}?data-nlw-npc-nhan', html, re.I):
        npc_names.add(m.group(1))
print("npc excluded", len(npc_names))

catalog = []
by_type: dict[str, list] = {k: [] for k in TYPE_KEYS}
for url, name in seen.items():
    if name in npc_names:
        continue
    f = url_to_file.get(url)
    if not f:
        continue
    path = OUT / f
    if not path.exists() or path.stat().st_size < 3000:
        continue  # skip tiny UI chrome
    t = classify(name)
    entry = {"name": name, "file": f, "url": url, "type": t, "bytes": path.stat().st_size}
    catalog.append(entry)
    if t:
        by_type[t].append(entry)

(OUT / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
for t, items in by_type.items():
    items.sort(key=lambda x: -x["bytes"])
    print(t, len(items), "top:", [i["name"] for i in items[:5]])

# Pick best representative per troop for battle token
picks = {}
for t, items in by_type.items():
    if items:
        picks[t] = items[0]
    else:
        # fallback: largest unused icons
        picks[t] = None

# Fallbacks from largest named icons if classify missed
big = sorted(catalog, key=lambda x: -x["bytes"])
used = {p["file"] for p in picks.values() if p}
for t in TYPE_KEYS:
    if picks[t] is None:
        for e in big:
            if e["file"] not in used:
                picks[t] = e
                used.add(e["file"])
                break

troop_map = {}
for t, e in picks.items():
    if not e:
        continue
    dest_name = f"wiki-{t}.png"
    shutil.copy2(OUT / e["file"], BATTLE / dest_name)
    # also keep in wiki/
    shutil.copy2(OUT / e["file"], OUT / dest_name)
    troop_map[t] = {
        "file": f"assets/units/battle/{dest_name}",
        "wikiName": e["name"],
        "source": e["url"],
        "bytes": e["bytes"],
    }
    print("PICK", t, e["name"], e["bytes"])

(OUT / "troop-map.json").write_text(json.dumps(troop_map, ensure_ascii=False, indent=2), encoding="utf-8")
(BATTLE / "troop-map.json").write_text(json.dumps(troop_map, ensure_ascii=False, indent=2), encoding="utf-8")
print("wrote troop-map", len(troop_map))
