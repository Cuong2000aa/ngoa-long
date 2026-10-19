#!/usr/bin/env python3
"""
Tải icon hiệu ứng từ wiki hieu-ung → assets/ui/status/
Cập nhật data/status-effects.json: iconLocal = đường dẫn local.

Chạy: python3 scripts/download-status-icons.py
"""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATUS = ROOT / "data" / "status-effects.json"
OUT_DIR = ROOT / "assets" / "ui" / "status"
UA = "Mozilla/5.0 (compatible; NgoaLongFanRemake/1.0)"


def fname_from_url(url: str) -> str:
    # .../icons/6e49dbe9-0706-4c57-a198-6461dc1dc9ec.51415.png
    m = re.search(r"/icons/([^/?#]+)$", url)
    if m:
        return m.group(1)
    return re.sub(r"[^a-zA-Z0-9._-]+", "_", url[-48:])


def download(url: str, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 50:
        return True
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://ngoalong.vnggames.com/"})
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            data = r.read()
        if len(data) < 40:
            return False
        dest.write_bytes(data)
        return True
    except Exception as e:
        print("FAIL", url[-50:], e)
        return False


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    data = json.loads(STATUS.read_text(encoding="utf-8"))
    cat = data.get("wikiCatalog") or []
    ok = skip = fail = 0
    url_to_local: dict[str, str] = {}

    for e in cat:
        url = e.get("icon")
        if not url:
            e.pop("iconLocal", None)
            continue
        fn = fname_from_url(url)
        dest = OUT_DIR / fn
        if download(url, dest):
            local = f"assets/ui/status/{fn}"
            e["iconLocal"] = local
            url_to_local[url] = local
            ok += 1 if not dest.exists() else 0
            skip += 1
        else:
            fail += 1

    # Gắn iconLocal vào engine effects (map wikiId / wiki name)
    by_id = {x["id"]: x for x in cat if x.get("id")}
    by_name = {(x.get("name") or "").lower(): x for x in cat}
    effects = data.get("effects") or {}
    for eid, ev in effects.items():
        hit = by_id.get(ev.get("wikiId") or "") or by_name.get((ev.get("wiki") or ev.get("label") or "").lower())
        if hit and hit.get("iconLocal"):
            ev["iconLocal"] = hit["iconLocal"]
            if hit.get("icon"):
                ev["icon"] = hit["icon"]

    data["iconDir"] = "assets/ui/status"
    data["iconNote"] = "Icon wiki hieu-ung — tải bằng scripts/download-status-icons.py"
    STATUS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    nfiles = len(list(OUT_DIR.glob("*")))
    print(f"catalog icons ok≈{skip} fail={fail} files_in_dir={nfiles}")
    print(f"engine effects with iconLocal: {sum(1 for v in effects.values() if v.get('iconLocal'))}")


if __name__ == "__main__":
    main()
