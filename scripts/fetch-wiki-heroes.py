# -*- coding: utf-8 -*-
"""
Tải toàn bộ võ tướng từ wiki Ngọa Long VNG CDN (playable + NPC).

Nguồn:
  https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/

Xuất:
  _dl/wiki-heroes/hero-mini.json
  _dl/wiki-heroes/hero/{id}.json
  _dl/wiki-heroes/roster.json
  _dl/wiki-heroes/index.json          # tóm tắt + skill ladder VI
  data/wiki/heroes-index.json         # bản copy nhẹ cho app/docs
  docs/wiki/VO-TUONG.md
"""
from __future__ import annotations

import json
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/"
DL = ROOT / "_dl" / "wiki-heroes"
HERO_DIR = DL / "hero"
OUT_DATA = ROOT / "data" / "wiki"
DOCS = ROOT / "docs" / "wiki"

UA = {"User-Agent": "Mozilla/5.0 (compatible; NgoaLongFanRemake/1.0)"}
WORKERS = 12


def get_bytes(url: str, retries: int = 4) -> bytes:
    last: Exception | None = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(0.4 * (i + 1))
    assert last is not None
    raise last


def load_or_fetch_mini() -> dict:
    DL.mkdir(parents=True, exist_ok=True)
    path = DL / "hero-mini.json"
    if not path.exists() or path.stat().st_size < 100:
        print("fetch hero-mini.json …")
        path.write_bytes(get_bytes(BASE + "data/hero-mini.json"))
    return json.loads(path.read_text(encoding="utf-8"))


def fetch_one(hid: str) -> tuple[str, bool, str]:
    dest = HERO_DIR / f"{hid}.json"
    if dest.exists() and dest.stat().st_size > 200:
        return hid, False, "skip"
    try:
        data = get_bytes(BASE + f"data/hero/{hid}.json")
        dest.write_bytes(data)
        return hid, True, "ok"
    except Exception as e:  # noqa: BLE001
        return hid, False, f"FAIL {e}"


def summarize_hero(d: dict) -> dict:
    tiers = []
    for t in d.get("viTiers") or []:
        sk = t.get("skill") or {}
        tiers.append(
            {
                "q": t.get("q"),
                "qName": t.get("qName"),
                "skillName": sk.get("name"),
                "skillDesc": sk.get("desc"),
                "buffs": sk.get("buffs") or [],
            }
        )
    # fallback top-level vi skill (often max tier)
    vi = d.get("vi") or {}
    vi_sk = vi.get("skill") or {}
    return {
        "id": str(d.get("id")),
        "name": d.get("name") or vi.get("name"),
        "nameZh": d.get("nameZh"),
        "faction": d.get("faction"),
        "nation": d.get("nation"),
        "quality": d.get("quality"),
        "qualityName": d.get("qualityName"),
        "leadership": d.get("leadership"),
        "war": d.get("war"),
        "intellect": d.get("intellect"),
        "units": d.get("units"),
        "bio": (d.get("bio") or "")[:400],
        "viMaxSkill": {
            "name": vi_sk.get("name"),
            "desc": vi_sk.get("desc"),
            "buffs": vi_sk.get("buffs") or [],
        },
        "tiers": tiers,
        "tierCount": len(tiers),
    }


def main() -> int:
    HERO_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DATA.mkdir(parents=True, exist_ok=True)
    DOCS.mkdir(parents=True, exist_ok=True)

    mini = load_or_fetch_mini()
    ids = sorted(mini.keys(), key=lambda x: int(x) if str(x).isdigit() else str(x))
    print(f"heroes: {len(ids)}")

    roster = []
    for hid in ids:
        m = mini[hid]
        roster.append(
            {
                "id": hid,
                "name": m.get("n") or m.get("name"),
                "img": m.get("i"),
                "nation": m.get("p"),
            }
        )
    (DL / "roster.json").write_text(
        json.dumps(roster, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (DL / "ids.json").write_text(json.dumps(ids, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    ok = skip = fail = 0
    fails: list[str] = []
    print(f"download hero/*.json with {WORKERS} workers …")
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = [ex.submit(fetch_one, hid) for hid in ids]
        done = 0
        for fut in as_completed(futs):
            hid, downloaded, status = fut.result()
            done += 1
            if status.startswith("FAIL"):
                fail += 1
                fails.append(f"{hid}: {status}")
            elif downloaded:
                ok += 1
            else:
                skip += 1
            if done % 50 == 0 or done == len(ids):
                print(f"  {done}/{len(ids)}  new={ok} skip={skip} fail={fail}")

    # retry fails once
    if fails:
        print(f"retry {len(fails)} …")
        still = []
        for line in fails:
            hid = line.split(":", 1)[0]
            _, downloaded, status = fetch_one(hid)
            if status.startswith("FAIL"):
                still.append(f"{hid}: {status}")
            elif downloaded:
                ok += 1
                fail -= 1
        fails = still

    # build index
    index = []
    by_nation: dict[str, int] = {}
    skill_names: set[str] = set()
    for hid in ids:
        path = HERO_DIR / f"{hid}.json"
        if not path.exists():
            continue
        d = json.loads(path.read_text(encoding="utf-8"))
        s = summarize_hero(d)
        index.append(s)
        nat = s.get("nation") or "?"
        by_nation[nat] = by_nation.get(nat, 0) + 1
        for t in s.get("tiers") or []:
            if t.get("skillName"):
                skill_names.add(t["skillName"])
        if s.get("viMaxSkill", {}).get("name"):
            skill_names.add(s["viMaxSkill"]["name"])

    meta = {
        "source": BASE,
        "heroCount": len(index),
        "uniqueSkillNames": len(skill_names),
        "byNation": dict(sorted(by_nation.items(), key=lambda x: -x[1])),
        "downloadedNew": ok,
        "skippedExisting": skip,
        "failed": len(fails),
        "failures": fails,
        "note": "Bao gồm toàn bộ tướng wiki (playable + NPC / Trung lập / Quần).",
    }
    payload = {"meta": meta, "heroes": index}
    (DL / "index.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    # lightweight copy for data/
    light = {
        "schemaVersion": 1,
        "source": BASE + "data/hero/",
        "count": len(index),
        "byNation": meta["byNation"],
        "heroes": [
            {
                "id": h["id"],
                "name": h["name"],
                "nation": h.get("nation"),
                "faction": h.get("faction"),
                "qualityName": h.get("qualityName"),
                "tierCount": h.get("tierCount"),
                "skills": [
                    {"q": t["q"], "qName": t["qName"], "name": t["skillName"]}
                    for t in (h.get("tiers") or [])
                ],
            }
            for h in index
        ],
    }
    (OUT_DATA / "heroes-index.json").write_text(
        json.dumps(light, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    # docs
    lines = [
        "# Võ tướng wiki — snapshot",
        "",
        f"> Nguồn CDN: `{BASE}`",
        f"> Tổng **{len(index)}** tướng (playable + NPC).",
        f"> Unique tên chiêu (qua các phẩm): **{len(skill_names)}**.",
        "",
        "## Theo quốc",
        "",
    ]
    for nat, n in meta["byNation"].items():
        lines.append(f"- **{nat}**: {n}")
    lines += [
        "",
        "## File local",
        "",
        "- `_dl/wiki-heroes/hero-mini.json`",
        "- `_dl/wiki-heroes/hero/{id}.json` — full (viTiers, seals, …)",
        "- `_dl/wiki-heroes/index.json` — tóm tắt + desc chiêu",
        "- `data/wiki/heroes-index.json` — index nhẹ",
        "",
        "## Ví dụ Bàng Đức (4142)",
        "",
    ]
    bang = next((h for h in index if h["id"] == "4142" or h["name"] == "Bàng Đức"), None)
    if bang:
        for t in bang.get("tiers") or []:
            lines.append(f"- **{t.get('qName')}**: {t.get('skillName')}")
            if t.get("skillDesc"):
                lines.append(f"  - {t['skillDesc'][:160]}{'…' if len(t['skillDesc'])>160 else ''}")
    lines.append("")
    (DOCS / "VO-TUONG.md").write_text("\n".join(lines), encoding="utf-8")

    print(
        f"DONE heroes={len(index)} new={ok} skip={skip} fail={len(fails)} "
        f"uniqueSkills={len(skill_names)}"
    )
    if fails:
        print("FAILURES:")
        for f in fails[:20]:
            print(" ", f)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
