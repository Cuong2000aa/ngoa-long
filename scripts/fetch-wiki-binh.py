# -*- coding: utf-8 -*-
"""Tải ảnh minh họa binh chủng từ wiki Ngọa Long VNG."""
from __future__ import annotations

import json
import os
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "units" / "wiki"
DL = ROOT / "_dl" / "wiki-binh"
OUT.mkdir(parents=True, exist_ok=True)
DL.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
URL = "https://ngoalong.vnggames.com/ngoa-long-wiki/binh-chung"


def fetch(url: str, dest: Path | None = None) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://ngoalong.vnggames.com/"})
    with urllib.request.urlopen(req, timeout=45) as r:
        data = r.read()
    if dest:
        dest.write_bytes(data)
    return data


def main() -> None:
    html_path = DL / "page.html"
    if not html_path.exists() or html_path.stat().st_size < 1000:
        print("fetch page…")
        fetch(URL, html_path)
    html = html_path.read_text(encoding="utf-8", errors="ignore")
    print("html", len(html))

    # Absolute + protocol-relative + common CDN patterns
    urls = []
    for m in re.finditer(
        r"(?:https?:)?//[^\s\"'<>]+\.(?:png|jpe?g|webp|gif)",
        html,
        re.I,
    ):
        u = m.group(0)
        if u.startswith("//"):
            u = "https:" + u
        urls.append(u)
    # relative
    for m in re.finditer(r'["\'](/[^"\']+\.(?:png|jpe?g|webp))["\']', html, re.I):
        urls.append("https://ngoalong.vnggames.com" + m.group(1))

    # Next.js / JSON blobs often embed image paths
    for m in re.finditer(r'"(https?://[^"]+\.(?:png|jpe?g|webp))"', html, re.I):
        urls.append(m.group(1))
    for m in re.finditer(r'"(/_next/image\?[^"]+)"', html):
        urls.append("https://ngoalong.vnggames.com" + m.group(1).replace("\\u0026", "&"))

    seen = []
    for u in urls:
        u = u.replace("\\/", "/")
        if u not in seen:
            seen.append(u)

    print("unique urls", len(seen))
    (DL / "urls.json").write_text(json.dumps(seen, indent=2, ensure_ascii=False), encoding="utf-8")
    for u in seen[:100]:
        print(" ", u[:160])

    # Heuristic: troop icons often contain binh / troop / unit / avatar / card
    keys = ("binh", "troop", "unit", "quan", "ky", "cung", "thuong", "bo-", "muu", "soldier", "cavalry", "archer", "spear", "thumb", "icon", "card", "avatar", "mwly", "zing")
    picked = [u for u in seen if any(k in u.lower() for k in keys)]
    if not picked:
        picked = seen[:40]
    print("picked", len(picked))

    saved = []
    for i, u in enumerate(picked[:60]):
        ext = ".png"
        low = u.lower().split("?")[0]
        for e in (".png", ".jpg", ".jpeg", ".webp", ".gif"):
            if low.endswith(e):
                ext = e
                break
        name = f"wiki_{i:02d}{ext}"
        # try extract meaningful name
        base = re.sub(r"[^\w\-]+", "_", Path(low).stem)[:48]
        if base and base not in ("image", "img", "thumb"):
            name = f"{base}{ext}"
        dest = OUT / name
        try:
            if dest.exists() and dest.stat().st_size > 500:
                print("skip", dest.name)
            else:
                print("dl", name, "…")
                fetch(u, dest)
            saved.append({"file": name, "url": u})
        except Exception as ex:
            print("FAIL", u[:80], ex)

    (OUT / "manifest.json").write_text(json.dumps(saved, indent=2, ensure_ascii=False), encoding="utf-8")
    print("saved", len(saved), "→", OUT)


if __name__ == "__main__":
    main()
