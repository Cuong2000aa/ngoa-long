# -*- coding: utf-8 -*-
"""
Tải trang bị / ngựa / binh thư từ wiki Ngọa Long VNG CDN.

Nguồn:
  https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/

Xuất:
  _dl/wiki-equip/equip-detail.json
  _dl/wiki-equip/horse-detail.json
  _dl/wiki-equip/books-detail.json
  _dl/wiki-equip/item-catalog.json
  assets/items/wiki/<icon-file>
"""
from __future__ import annotations

import json
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://cdn-mainsite-aka.vnggames.com/products/mwly/landing/2026-ngoa-long-wiki-clone/"
DL = ROOT / "_dl" / "wiki-equip"
ICON_DIR = ROOT / "assets" / "items" / "wiki"
UA = {"User-Agent": "Mozilla/5.0 (compatible; NgoaLongFanRemake/1.0)"}
FILES = [
    "data/equip-detail.json",
    "data/horse-detail.json",
    "data/books-detail.json",
    "data/item-catalog.json",
]
WORKERS = 16


def get_bytes(url: str, retries: int = 4) -> bytes:
    last: Exception | None = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(0.35 * (i + 1))
    assert last is not None
    raise last


def fetch_jsons() -> None:
    DL.mkdir(parents=True, exist_ok=True)
    for rel in FILES:
        name = Path(rel).name
        dest = DL / name
        print("fetch", name, "…")
        dest.write_bytes(get_bytes(BASE + rel))
        print("  OK", dest.stat().st_size, "bytes")


def collect_icons() -> list[str]:
    icons: set[str] = set()
    eq = json.loads((DL / "equip-detail.json").read_text(encoding="utf-8"))
    for it in eq.get("items") or []:
        if it.get("icon"):
            icons.add(it["icon"])
    horses = json.loads((DL / "horse-detail.json").read_text(encoding="utf-8"))
    for h in horses.get("horses") or []:
        if h.get("icon"):
            icons.add(h["icon"])
    books = json.loads((DL / "books-detail.json").read_text(encoding="utf-8"))
    for b in books.get("books") or []:
        if b.get("icon"):
            icons.add(b["icon"])
    return sorted(icons)


def fetch_one_icon(name: str) -> tuple[str, bool, str]:
    dest = ICON_DIR / name
    if dest.exists() and dest.stat().st_size > 200:
        return name, False, "skip"
    try:
        data = get_bytes(BASE + "icons/" + name)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return name, True, "ok"
    except Exception as e:  # noqa: BLE001
        return name, False, f"FAIL {e}"


def fetch_icons() -> None:
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    icons = collect_icons()
    print(f"icons unique={len(icons)}")
    ok = skip = fail = 0
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = [ex.submit(fetch_one_icon, n) for n in icons]
        for fut in as_completed(futs):
            name, wrote, status = fut.result()
            if status == "ok":
                ok += 1
            elif status == "skip":
                skip += 1
            else:
                fail += 1
                print(" ", name, status)
    print(f"icons done ok={ok} skip={skip} fail={fail}")


def main() -> None:
    fetch_jsons()
    fetch_icons()
    print("DONE →", DL, "·", ICON_DIR)


if __name__ == "__main__":
    main()
