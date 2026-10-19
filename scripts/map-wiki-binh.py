# -*- coding: utf-8 -*-
"""Parse wiki HTML: gắn tên binh chủng → URL ảnh, tải 5 hệ chính + vài bậc đẹp."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DL = ROOT / "_dl" / "wiki-binh"
OUT = ROOT / "assets" / "units" / "wiki"
OUT.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
html = (DL / "page.html").read_text(encoding="utf-8", errors="ignore")

# Next.js often embeds JSON in script tags
blobs = re.findall(r"<script[^>]*>(\{.*?\})</script>", html, re.S)
print("script json-ish", len(blobs))

# Find icon CDN urls near Vietnamese troop keywords
ICON_RE = re.compile(
    r"https://cdn-mainsite-aka\.vnggames\.com/products/mwly/landing/2026-ngoa-long-wiki-clone/icons/[a-f0-9\-]+\.[a-z0-9]+\.png",
    re.I,
)
icons = list(dict.fromkeys(ICON_RE.findall(html)))
print("icons", len(icons))

# Also search img.zing.vn mwly uploads
ZING = re.compile(r"https://img\.zing\.vn/upload/mwly/[^\"'\s]+\.(?:png|jpe?g|webp)", re.I)
zing = list(dict.fromkeys(ZING.findall(html)))
print("zing", len(zing))
for u in zing[:30]:
    print(" Z", u)

# Look for __NEXT_DATA__
m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
mapping = []
if m:
    data = json.loads(m.group(1))
    (DL / "next-data.json").write_text(json.dumps(data, ensure_ascii=False)[:500000], encoding="utf-8")
    raw = json.dumps(data, ensure_ascii=False)

    # Walk for objects with name + image
    def walk(o, path=""):
        if isinstance(o, dict):
            keys = {k.lower(): k for k in o.keys()}
            name_k = keys.get("name") or keys.get("title") or keys.get("ten")
            img_k = None
            for cand in ("image", "img", "icon", "avatar", "thumbnail", "thumb", "url", "src", "art"):
                if cand in keys:
                    img_k = keys[cand]
                    break
            if name_k and img_k and isinstance(o[name_k], str) and isinstance(o[img_k], str):
                mapping.append({"name": o[name_k], "image": o[img_k], "path": path})
            for k, v in o.items():
                walk(v, path + "/" + str(k)[:40])
        elif isinstance(o, list):
            for i, v in enumerate(o[:500]):
                walk(v, path + f"[{i}]")

    walk(data)
    print("name+image pairs", len(mapping))
    (DL / "pairs.json").write_text(json.dumps(mapping[:200], ensure_ascii=False, indent=2), encoding="utf-8")
    for p in mapping[:40]:
        print(p["name"][:40], "→", str(p["image"])[:100])
else:
    print("no __NEXT_DATA__")
    # dump snippet around first icon
    i = html.find("2026-ngoa-long-wiki-clone/icons/")
    print(html[max(0, i - 200) : i + 300] if i >= 0 else "no icons in html?")


def fetch(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://ngoalong.vnggames.com/"})
    with urllib.request.urlopen(req, timeout=40) as r:
        dest.write_bytes(r.read())


# Download ALL unique icons (troop portraits on wiki are these hashed pngs)
saved = []
for i, u in enumerate(icons):
    name = f"icon_{i:03d}.png"
    dest = OUT / name
    if not dest.exists() or dest.stat().st_size < 200:
        try:
            fetch(u, dest)
            print("ok", name, dest.stat().st_size)
        except Exception as e:
            print("fail", i, e)
            continue
    saved.append({"file": name, "url": u})

(OUT / "manifest.json").write_text(json.dumps(saved, ensure_ascii=False, indent=2), encoding="utf-8")
print("done icons", len(saved))
